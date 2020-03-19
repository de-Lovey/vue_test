module.exports = {
    //自定义打包入口
    chainWebpack: config => {
        //发布模式, 通过when()判断其编译模式是运行模式的话, 
        config.when(process.env.NODE_ENV === 'production', config => {
                //entry找到默认的打包入口，调用clear则是删除默认的打包入口
                //add添加新的打包入口
                config.entry('app').clear().add('./src/main-prod.js')

                //使用externals设置排除项
                config.set('externals', {
                    vue: 'Vue',
                    'vue-router': 'VueRouter',
                    axios: 'axios',
                    lodash: '_',
                    echarts: 'echarts',
                    nprogress: 'NProgress',
                    'vue-quill-editor': 'VueQuillEditor'
                })

                //开发环境的首页和发布环境的首页展示内容的形式有所不同, 如果是生产模式, 则追加一个自定义属性isProd
                config.plugin('html').tap(args => {
                    args[0].isProd = true
                    return args;
                })

            })
            //开发模式
        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main-dev.js')
                //如果是开发模式, 则为false
                //再去首页title中, 通过三元表达式判断这个isProd显示对应的标题
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args;
            })
        })
    }
}