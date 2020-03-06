<template>
<!-- 1. 制作首页静态, 复制element官网中container组件里的第四个结构 -->
<!-- 2. 按需导入相关组件 -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 2. 导入element中导航菜单组件...自定义颜色菜单, 只需要一二级菜单, 需要删掉部分元素-->
      <!-- 3. 通过接口获取菜单数据, 打开api接口文档.
          需要授权的 API ，必须在请求头中使用 Authorization 字段提供 token 令牌
          意思就是除了登录接口, 所有需要授权的api接口都需要提供这个字段, 那么目前有n多个接口, 每一个都要提供太麻烦了, 所以采用axios请求拦截器来添加token, 保证拥获取数据的权限
          去main.js中设置拦截器
      
        -->
        <!-- 10. 通过isCollapse操作当前侧边栏的宽度 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 9. 点击按钮切换侧边栏的折叠和展开, 找官网属性collapse, 去data中设置布尔值操作他 collapse-transition="false" 阻止折叠动画-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <!-- 8. 优化只允许一个子菜单显示, 在官网导航菜单中 找unique-opened属性 -->
         <el-menu
         unique-opened
         :collapse="isCollapse"
         :collapse-transition="false"
         router
         :default-active="activePath"
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF">
      <!-- 11. 在main.js中重定向welcome路由后, 改造二级菜单的路由, 设置router属性, 重新绑定index值为路径跳转  :index="'/'+subItem.path"-->
      <!-- 12. 点击二级菜单, 高亮显示 default-active="/users" 不能写死, 需要给二级菜单绑定click事件, 保存index所存入的值, 根据storage保存这个值, 为了页面刷新时获取  :default-active="activePath" -->
      <!-- 一级菜单 -->
      <!-- 5. 渲染动态数据, 注意 : index都是1,需要动态绑定不同的id, 但必须是字符串, 用拼接法 :index="item.id + ''" -->
      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单模板区域 -->
        <template slot="title">
          <!-- 图标 -->
          <!-- 7.1 通过id取对应的图标类 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{ item.authName }}</span>
        </template>
        <!-- 二级菜单 -->
        <!-- 6. 渲染二级菜单, 然后去优化高亮显示的颜色 -->
       <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
       <!-- 12.1 点击传入对应的参数值 -->
          <template slot="title">
          <!-- 图标 -->
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{ subItem.authName }}</span>
        </template>
       </el-menu-item>
      </el-submenu>
      
    </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      //7. 由于一级菜单图标各不一样, 使用element图标已经不满足需求, 需要使用第三方图标, 以id作为key, 图标名为value, 设置对应的图标, 去main.js导入字体图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 9.1 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
     this.getMenuList()
     //12.5 页面刷新时, 二级菜单高亮显示
      this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    //退出操作
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 4. 获取所有的菜单 ==1.4.2. 左侧菜单权限接口
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      //console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //4.1将data保存在data中的参数
      this.menulist = res.data
    },
    // 9.2点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 12.2保存链接的激活状态
    saveNavState(activePath) {
      //12.3 保存到本地中, 用于页面初始化时对应的二级菜单高亮显示
      window.sessionStorage.setItem('activePath', activePath)
      //12.4 将path路径存到data中
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    img{
      width: 60px;
    }
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
