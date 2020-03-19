<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片式图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 3.复制带有搜索按钮的input组件结构, v-model暂时不考虑  -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
              <!-- 9.点击搜索功能,使用v-model绑定关键字, 点击再次触发, 使用clearable属性,调用@clear事件再再次触发 -->
            <el-button slot="append" @click="getGoodsList" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 4. 调接口, 获取表单数据 -->
      <!-- 5.渲染table表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column width="95" label="商品价格(元)" prop="goods_price"></el-table-column>
        <el-table-column width="70" label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column width="140" label="创建时间" prop="add_time">
          <template slot-scope="scope">
            <!-- 6.去main.js下载并运用插件格式化时间 -->
            {{ scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column width="130" label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <!-- 10.删除功能 -->
            <el-button size="mini" @click="removeById(scope.row.goods_id)" type="danger" icon="el-icon-delete"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 7.复制完整功能的分页器, 并梳理结构, 定义改变事件 background:添加背景颜色 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //5.查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [], //商品列表
      total: 0 //商品总数
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //4. 根据分页获取对应的数据列表1.8.1
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败')
      //成功则保存到data中
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //8.handleSize改变时的函数,就可以获取最新的size
    // 9.去结构中实现点击搜索功能
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },
    //10.点击根据id删除
    async removeById(id){
        //11.复制弹框
         const confirmResult =await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm'){
            return this.$message.info("已取消删除")
        }
        //点击确认删除时, 请求数据1.8.5
        const {data: res} = await this.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200) return this.$message.error("删除商品失败");
        //删除成功
        this.$message.success("删除商品成功");
        this.getGoodsList();
    },
    //12.点击添加商品
    goAddpage(){
        this.$router.push('/goods/add')
    },//13.新建添加商品组件, 注意跳转路径
  }
}
</script>

<style lang="less" scoped>
</style>