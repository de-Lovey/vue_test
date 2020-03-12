import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'

//导入table表格插件-------------------------------------------------
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)

//导入富文本编辑器==============================================
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
//全局注册富文本组件
Vue.use(VueQuillEditor)

//在开发依赖中下载moment.js, 然后导入
import moment from 'moment';
//渲染商品列表时,   全局注册格式化时间的过滤器
Vue.filter('dateFormat', function(originVal) {
    return moment(originVal).format("YYYY-MM-DD hh:mm:ss");
})


import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //1. 请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(config => {
    //为请求头对象，添加token验证的Authorization字段
    //console.log(config); //查看header对象
    config.headers.Authorization = window.sessionStorage.getItem("token")
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')