module.exports = {
  sourceType: "unambiguous",
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          ie: "11"
        }
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime", {
        corejs: 3,
        proposals: true
      }
    ]
  ]
};
