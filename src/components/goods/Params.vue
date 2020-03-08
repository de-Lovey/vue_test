<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 2.卡片式图 -->
    <el-card>
      <!-- 3.找alert警告组件复制, :closable="false"属性禁止X号 show-icon图标 -->

      <el-alert title="注意:只允许为第三级分类设置参数!" type="warning" :closable="false" show-icon></el-alert>

      <!-- 4.选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框, 先获取数据,再复制Cascader组件 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- 11.找tabs标签页组件复制, v-model="activeName" 被激活页签的名称,去data定义默认选中标签页-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 14.添加按钮, 如果级联未选择3级,则为禁用状态, 在computed中定义方法通过布尔值来操作  -->
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
          >添加参数</el-button>

          <!-- 21.动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 41. 渲染标签, 添加closable关闭属性 -->
              <!-- 42. 优化, 当点击新增属性时,会出现多余的标签, 去forEach中判断一下 -->
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                <!-- 43.导入动态编辑标签结构, 然后梳理结构,去data中定义v-if中的inputVisible, 和v-model中的inputValue, 暂时不写scope.row -->
                <!-- 48.优化同时在给两个tag中的input设置文字, 添加scope.row  -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                <!-- 49.点击时也要相应的传对应的scope.row -->
                <!-- 49.函数里也要用形参接收row, 更改为row.inputValue = true;-->
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  type="danger"
                  icon="el-icon-delete"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
          >添加属性</el-button>
          <!-- 22.复制动态参数表格---静态表格-->
          <el-table :data="onlyTableData" border stripe>
            <!-- 58. 复制动态参数的展开行, 测试即可 -->
            <el-table-column type="expand">
              <!-- 41. 渲染标签, 添加closable关闭属性 -->
              <!-- 42. 优化, 当点击新增属性时,会出现多余的标签, 去forEach中判断一下 -->
              <template slot-scope="scope">
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                <!-- 43.导入动态编辑标签结构, 然后梳理结构,去data中定义v-if中的inputVisible, 和v-model中的inputValue, 暂时不写scope.row -->
                <!-- 48.优化同时在给两个tag中的input设置文字, 添加scope.row  -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                <!-- 49.点击时也要相应的传对应的scope.row -->
                <!-- 49.函数里也要用形参接收row, 更改为row.inputValue = true;-->
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 31.点击编辑 -->
                <el-button
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  type="primary"
                  icon="el-icon-edit"
                >编辑</el-button>
                <el-button
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  type="danger"
                  icon="el-icon-delete"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 23.点击添加参数的对话框, 因两个弹框一样, 文字不一样, 在计算属性中判断 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 27.复制带有验证的表单组件的前四行 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <!-- prop的值应该与提交数据时设置的参数名一致 -->
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 32.点击修改参数的对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 27.复制带有验证的表单组件的前四行 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <!-- prop的值应该与提交数据时设置的参数名一致 -->
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品列表
      catelist: [],
      //7.级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //8. 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //12.被激活页签的名称, 默认值
      //   activeName:'first',
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      onlyTableData: [], // 静态属性的数据
      //25.控制 定义控制弹框的显示与隐藏
      addDialogVisible: false,
      //26. 点击添加按钮, 显示弹框@click="addDialogVisible = true"
      //27. 复制带有验证的表单组件的前四行 , 再定义表单数据对象
      addForm: {
        attr_name: ''
      },
      //28. 定义表单的验证规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      //33. 控制修改弹框的显示与隐藏
      editDialogVisible: false,
      //34. 用@close事件重置表单
      //35. 修改表单的数据对象
      editForm: {},
      //36. 规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      } ,//37. 定义点击确定的事件
      //44. 定义控制按钮与文本框的切换显示
      inputVisible: false,
      //文本框中输入的内容
      inputValue :'',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //6. 获取商品分类列表1.6.1 因为要获取所有的3级数据, 所以不需要传参数
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败')
      //成功则保存到data中
      this.catelist = res.data
    },
    //9.级联选择框改变的函数
    async handleChange() {
      console.log(this.selectedCateKeys) //打印测试
      //10. 因为只允许为第三级分类设置参数,根据数组长度而判断是否是3级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [] //不是三级分类则清空数组;
        //57.最后的最后,优化若再次选择商品分类的只选择了2级,则需要清空两个表格
        this.manyTableData = [];
        this.onlyTableData = [];
        return
      }
      //18. 根据所选id和对应面板发请求1.7.1
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('获取参数列表失败')
      //成功则打印测试

      //40. 分析展开行的数据, 有多个标签, 而我们获取的数据是字符串, 改造成数组
      //   console.log(res.data);
      res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.split(",")
        // 42. 优化, 当点击新增属性时,会出现多余的标签, 去forEach中判断一下
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];

        //47. 优化:给每一个item添加控制文本框的属性和值
        item.inputVisible = false;
        item.inputValue = '';
        //48. 优化结构的v-if="scope.row.inputVisible" 和v-value
      })
      console.log(res.data) //41.去表格中渲染

      //20.因为页面有两个table表格, 需要根据activeName保存对应的数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //13.监听tab页签点击事件
    handleClick() {
      // console.log(this.activeName);
      this.handleChange() //19. 点击标签页时获取新的数据, 调用
    },
    //29. 关闭对话框时, 重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //30.点击确定按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        //成功则刷新数据列表
        this.$message.success('添加参数成功')
        this.handleChange()
        this.addDialogVisible = false
      })
    },
    //31.给两个面板中的编辑都绑定click事件
    async showEditDialog(attr_id) {
      //38. 点击编辑弹框的结构都梳理完之后, 分析接口中根据id获取当前数据, 传scope.row.attr_id, 发请求1.7.4
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      //成功则赋值数据
      this.editForm = res.data

      this.editDialogVisible = true //显示弹框
    },
    //34.重置修改的表单弹框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //37. 点击按钮修改表单的事件
    editParams() {
      //39.点击提交数据1.7.5
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        //成功则刷新数据
        this.$message.success('修改参数成功')
        this.handleChange()
        this.editDialogVisible = false
      })
    },
    //38.点击根据id删除数据1.7.3
    async removeParams(attr_id) {
      //39.复制弹框组件的消息确认框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //判断
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      //请求数据删除1.7.3
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除数据失败')
      //删除成功
      this.$message.success('删除数据成功')
      this.handleChange()
      //40. 分析展开行的数据, 有多个标签, 而我们获取的数据是字符串, 在handleChange方法中改造成数组
    },
    //45.文本框失去焦点或者按下enter键都会触发的函数
    async handleInputConfirm(row){
        //52. 失去焦点时, 传参, 判断是否有文字, 没有则重置参数, 隐藏文本框,
        if(row.inputValue.trim().length === 0){
            row.inputValue = '';
            row.inputVisible = false;
            return;
        }
        //53. 有文字则添加到页面中
        row.attr_vals.push(row.inputValue.trim());
        //重置参数
        row.inputValue = '';
        row.inputVisible = false;
        //54. 测试完之后, 添加到后台数据库中, 调接口1.7.5
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
        })
        if(res.meta.status !== 200) return this.$message.error("修改参数失败");
        //成功
        this.$message.success("修改参数成功");


    },
    //46.点击按钮, 展示文本输入框,50形参接收(注: 优化后再传参)
    showInput(row){
        //this.inputVisible = true;// 显示
        //测试后发现, 同时在给两个tag中的input设置文字,去forEach中优化一下
        row.inputVisible = true;//50. 更改
        //51. 点击自动聚焦通过文档复制 $nextTick()作用: 当页面上元素被重新渲染之后触发
         this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });

    },
    //55. 监听删除事件给el-tag绑定@close="handleClose(i)"
    async handleClose(i, row){
        //先删除页面的
        row.attr_vals.splice(i,1);
        //重新再添加到数据库中, 跟刚才一致, 可以封装一个函数调用
        this.saveAttrVals(row);

    },
    //56.封装
    async saveAttrVals(row){
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')
        })
        if(res.meta.status !== 200) return this.$message.error("修改参数失败");
        //成功
        this.$message.success("修改参数成功");

    }



  },
  //15.
  computed: {
    //15. 如果按钮需要被禁用, 则返回true, 否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    //16.因为要通过接口1.7.1获取参数列表, 通过computed定义方法来 , 获取当前选中的id
    //17. 再次分析接口参数, 根据当前选中的面板而传many还是only,改造面板的name名和data中activeName的默认选中名
    cateId() {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    //24. 动态计算弹框标题的文本
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>


<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag{
    width: 150px;
}
</style>