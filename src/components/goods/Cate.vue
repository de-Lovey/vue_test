<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片式图区域 -->
    <el-card>
      <!-- 3.button按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 8.去可视化工具里的依赖里添加vue-table-width-tree-grid插件, 安装时点击进去详情来到github中查看导入的方式, 去mian.js导入 -->
      <!-- 9. 根据github中的example中的例子, 配置表格分类, 注意columns属性
:data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
:expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
      border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮), 禁止掉-->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 11. 定义模板列, 用slot="isok"申明模板名 -->
        <template slot="isok" slot-scope="scope">
          <!-- 12. 第二列模板, 使用列表中的cat_deleted的布尔值来按需设置, if判断 -->
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 14. 第三列的模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 16. 第四列的模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>

      <!-- 17. 分页区域--拷贝组件的完整功能的分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 20.点击添加分类按钮, 弹框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 23.找带有验证的表单组件, 赋值前4行 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 28.页面测试后, 再添加一个item项 -->
        <el-form-item label="父级名称:">
          <!-- 31. 找Cascader连级选择器组件, 复制hover例子 -->
          <!--expand-trigger="hover"悬浮效果 
          options指定数据源 props指定配置对象, 去data中定义对象
          v-model绑定要选中的值,必须是数组, 例:选择大家电中的电视, 要存当前两个id值 
          clearable(提供“X”号完成删除文本功能) change-on-select(是否可以选中任意一级的菜单)-->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //5.商品分类数据列表
      cateList: [],
      //6. 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //7.总数据条数
      total: 0,
      // 为table指定列的定义  label指定列标题名称, prop指定属性名
      columns: [
        { label: '分类名称', prop: 'cat_name' }, //第一列
        //10. 第二列, 根据github中的文档使用columns中的自定义模板列
        {
          label: '是否有效',
          //表示当前列为模板列
          type: 'template',
          //表示这一列使用的模板名称
          template: 'isok'
        },
        //13. 第三列
        {
          label: '排序',
          type: 'template',
          template: 'order'
        }, //15. 第四列
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      //21. 控制弹框的显示与隐藏
      addCateDialogVisible: false,
      //24. 定义添加分类表单的数据对象
      addCateForm: {
        //25. 将要添加分类的名称
        cat_name: '',
        //27. 根据接口文档要传的参数, 再设置父级分类的id
        cat_pid: 0,
        //分类的等级, 默认要添加的是1级分类
        cat_level: 0
      },
      //26. 添加验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //30. 存储父级分类列表
      parentCateList: [],
      //32. 定义联动中的配置对象
      cascaderProps: {
        value: 'cat_id', //指定选项的id值
        label: 'cat_name', //指定显示的值
        children: 'children', //指定子级属性
        expandTrigger: 'hover' //移入展开次级菜单
      },
      //33.定义选中的父级分类的数组id
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //4. 获取商品分类列表1.6.1, 因为涉及到分页, 在data中定义这些参数
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品分类失败')
      //成功, 则保存到data中
      this.cateList = res.data.result
      //7. 保存总条数
      this.total = res.data.total
    },
    //18.监听pagesize变化
    handleSizeChange(newsize) {
      //赋值给queryInfo中的参数
      this.queryInfo.pagesize = newsize
      this.getCateList() //刷新数据
    },
    //19.监听pagenum的改变
    handleCurrentChange(newnum) {
      this.queryInfo.pagenum = newnum
      this.getCateList() //刷新数据
    },
    //22. 点击按钮显示弹框
    showAddCateDialog() {
      //30. 调用获取父类的数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true //显示
    },
    //29. 获取父级分类的数据列表1.6.1, 只需要添加前两项, 也不需要分页效果, 传参时要注意
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      //成功则保存在data中
      this.parentCateList = res.data
      //把函数调用在点击显示弹框的方法中
    },
    //34. 定义父级选项列表改变触发的事件
    parentCateChanged() {
      console.log(this.selectedKeys) //拿到选中的id数组
      //35.为了点击添加分类要确定参数, 根据当前数组长度判断父类id及层级
      if (this.selectedKeys.length > 0) {
        //证明选中了父类
        //取父类id == 数组里最后一个值
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //36. 分类传参的层级根据数组长度判断
        this.addCateForm.cat_level = this.selectedKeys.length
        return;
      } else {
        //否则, 再重新赋值为0
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //35. 点击确认按钮, 添加新的分类
    addCate() {
      console.log(this.addCateForm); //打印测试
      //37.如果校验成功, 请求数据1.6.2
      this.$refs.addCateFormRef.validate(async valid =>{
          if(!valid) return;
          const {data: res} = await this.$http.post('categories',this.addCateForm);
          if(res.meta.status !== 201) return this.$message.error("添加分类失败");
          //成功,则刷新数据
          this.$message.success("添加分类成功");
          this.getCateList();
           this.addCateDialogVisible = false //隐藏弹框

      })

    },
    //36.测试成功后, 给dialog监听@close事件, 重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      //还要清空数组
      this.selectedKeys = [];
      //清空参数值
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>