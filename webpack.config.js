// used library
const fs = require('fs');
const path = require("path");
const glob = require("glob");
const webpack = require('webpack');
const dayjs = require('dayjs');
const handlebarsUtils = require('handlebars-utils');

// used library (plugins)
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HandlebarsPlugin = require("handlebars-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// config
const publicPath = "/special/danuri/2022";



// package.json -----------------------------------------------
const packageJson = require('./package.json');
const includeModulePathPrefix = [];
includeModulePathPrefix.push(path.resolve(__dirname, "./src"));
for (const pkg in packageJson.dependencies) {
    includeModulePathPrefix.push(path.resolve(__dirname, "./node_modules", pkg));
}
// console.dir(includeModulePath);
// package.json -----------------------------------------------


// used plugins
const plugins = [
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        dayjs: 'dayjs',
        timezone: 'dayjs/plugin/timezone',
        utc: 'dayjs/plugin/utc',
        commaNumber: 'comma-number',
        cookie: ['js-cookie', 'default'], // js-cookie esm module
        base: './include/base',
        stringUtils: 'underscore.string'
    }),
    new MiniCssExtractPlugin({
        linkType: false,
        filename: (v) => { return v.chunk.name.startsWith('m_') ? path.join("." + publicPath, "css", "m_style.css") : path.join("." + publicPath, "css", "style.css"); }
    }),
    new HandlebarsPlugin({
        entry: path.join(__dirname, "./src/", "template", "layout", "**", "*.hbs"),
        output: path.join(__dirname, "./dist", publicPath, "[path]", "[name].html"),
        partials: [
            path.join(__dirname, "/src/", "template", "module", "**", "*.hbs")
        ],
        data: path.join(__dirname, "/src/data/main.json"),
        helpers: {
            nameOfHbsHelper: Function.prototype,
            projectHelpers: path.join(process.cwd(), "/helper", "*.js")
        },
        // register handlebars-utils helpers
        onBeforeSetup: function (Handlebars) {



            for (const fn in handlebarsUtils) {
                Handlebars.registerHelper(fn, handlebarsUtils[fn]);
            }
        },
        onBeforeAddPartials: function (Handlebars, partialsMap) { },
        onBeforeCompile: function (Handlebars, templateContent) {


        },
        onBeforeRender: function (Handlebars, data, filename) {
            // def helper global variable error correction
            if (data.def && data.def.length > 0) {
                for (let [index, varName] of data.def.entries()) {
                    if (data[varName]) {
                        delete data[varName];
                        delete data.def[index];
                    }
                }
            }

            return data;
        },
        onBeforeSave: function (Handlebars, resultHtml, filename) { },
        onDone: function (Handlebars, filename) { }
    }),
    new CopyWebpackPlugin({
        patterns: [
            { from: "./src/images", to: path.join("./", publicPath, "images") },
            { from: "./src/videos", to: path.join("./", publicPath, "videos/") },
            { from: "./src/fonts", to: path.join("./", publicPath, "fonts/") }
        ]
    }),
    new webpack.BannerPlugin({
        banner: `Build Date : ${dayjs().format("YYYY-MM-DD HH:mm:ss")} / Author : Sungho Kim`
    })
];

const config = {
    entry: 'config later',
    output: {
        publicPath: '',
        filename: path.join("./", publicPath, "js", "[name].js")
    },
    target: ["web", "es5"],
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false
                    }
                }
            })
        ]
    },
    devServer: {
        port: 443,
        allowedHosts: "all",
        devMiddleware: {
            writeToDisk: (filePath) => { return filePath.indexOf('.hot-update.') < 0; } // ignore writing hot-update files
        },
        server: {
            type: 'https',
            options: {
                key: fs.readFileSync('STAR.HTTPSCERT.co.kr.key'),
                cert: fs.readFileSync('STAR.HTTPSCERT.co.kr.crt')
            }
        },
        static: {
            directory: path.resolve(__dirname, "./dist")
        },
        proxy: {
            '/resources': {
                target: 'https://dev.test.co.kr',
                // secure: false,
                changeOrigin: true
            },
            '/api': {
                target: 'https://dev.test.co.kr',
                // secure: false,
                changeOrigin: true
            },
            '/**': {
                target: 'https://dev.test.co.kr',
                // secure: false,
                changeOrigin: true
            }
        }
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.js$/i,
                use: ["babel-loader"],
                include: (includePath) => {
                    const result = includeModulePathPrefix.reduce((acc, cur) => { return (acc || includePath.startsWith(cur)); }, false);
                    if (result) {
                        // console.log(`include module candidate: ${includePath}`);
                    }
                    return result;
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader?url=false",
                        options: {
                            sourceMap: false
                        }
                    }, 'sass-loader'],
                exclude: /node_modules/
            },
            {
                include: [
                    path.resolve(__dirname, "./src/images"),
                    path.resolve(__dirname, "./src/videos"),
                    path.resolve(__dirname, "./src/fonts")
                ],
                type: 'asset/resource',
                generator: {
                    filename: ({ filename }) => {
                        return filename.split("src/").join(publicPath + "/");
                    }
                }
            }
        ]
    }
};

module.exports = (env, argv) => {
    let javascriptSourceFiles = {
        'm_bundle': glob.sync("./src/js/m_*.js"),
        'bundle': glob.sync("./src/js/!(m_)*.js")
    };
    // console.dir(javascriptSourceFiles);

    config.entry = javascriptSourceFiles;
    config.mode = env.mode;
    config.optimization.minimize = (env.minimize != 'false');

    // evn sourceMap = true, activate sourcemap (js/css)
    if (env.sourceMap == 'true') {
        config.devtool = 'inline-source-map';
        config.module.rules[1].use[1].options.sourceMap = true;
    }

    // env analyzer = true, activate analyzer
    if (env.analyzer == 'true') {
        plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
