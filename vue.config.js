const CKEditorWebpackPlugin = require('@ckeditor/ckeditor5-dev-webpack-plugin')
const { styles } = require('@ckeditor/ckeditor5-dev-utils')

module.exports = {
  transpileDependencies: [/ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],

  configureWebpack: {
    plugins: [
      new CKEditorWebpackPlugin({
        language: 'ja'
      })
    ]
  },

  css: {
    loaderOptions: {
      postcss: styles.getPostCssConfig({
        themeImporter: {
          themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
        },
        minify: true
      })
    }
  },

  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.exclude.add(__dirname + '/node_modules/@ckeditor')
    svgRule.exclude.add(__dirname + '/src/assets/icons')
    config.module
      .rule('cke-svg')
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader')
    config.module
      .rule('custom-svg')
      .test(/src[/\\]assets[/\\]icons[/\\][^/\\]+\.svg$/)
      .use('raw-loader')
      .loader('raw-loader')
    config.module
      .rule('svg')
      .test(/.svg$/)
      .use('file-loader')
      .loader('raw-loader')
  }
}
