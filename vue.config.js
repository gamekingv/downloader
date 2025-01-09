module.exports = {
  transpileDependencies: [
    'vuetify',
    'json-editor-vue'
  ],
  configureWebpack: {
    module: {
      rules: [
        // Getting webpack to recognize the `.mjs` file
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  },
  publicPath: '',
  productionSourceMap: false,
};
