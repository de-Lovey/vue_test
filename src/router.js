import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
//1. 制作侧边栏伸缩功能后, 在后台首页添加子级路由, 在进入到home页面时, 直接重定向到welcome页面
//2. 回到home页面改造二级菜单的路由, 在官网上找router属性, 开启路由
import Welcome from './components/welcome.vue'
//3. 创建users页面, 并导入
import Users from './components/users/Users.vue'
//导入
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
//商品
import Cate from './components/goods/Cate.vue'

Vue.use(Router)

const router = new Router({
    routes: [
        { path: '/', redirect: '/login' },
        { path: '/login', component: Login },
        {
            path: '/home',
            redirect: '/welcome',
            component: Home,
            children: [
                { path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/categories', component: Cate },

            ]
        }
    ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
    // to 将要访问的路径
    // from 代表从哪个路径跳转而来
    // next 是一个函数，表示放行
    //     next()  放行    next('/login')  强制跳转

    if (to.path === '/login') return next()
        // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})

export default router