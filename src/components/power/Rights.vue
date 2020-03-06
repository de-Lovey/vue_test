<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片式图 -->
    <el-card>
      <!-- 4.使用table表格渲染数据 stripe:隔行变色 -->
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!-- 5.通过作用域插槽定义tag标签组件的格式 -->
          <template slot-scope="scope">
              <!-- 6. 通过v-if判断显示对应的等级 -->
              <!-- 7.写完去新建角色列表 -->
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //权限列表
      rightsList: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    //3.调用接口获取权限列表
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限列表失败')
      //成功则赋值
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  }
}
</script>

<style lang="less" scoped>
</style>