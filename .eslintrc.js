module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true
    },
    extends: 'standard-with-typescript',
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        semi: [2, 'always'],
        eqeqeq: 'off',
        quotes: ['off', 'single'],
        indent: ["error", 4]
    }
};
