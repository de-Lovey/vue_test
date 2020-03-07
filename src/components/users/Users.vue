<template>
  <!-- 1. 绘制用户列表基本结构 : 去官网找面包屑组件, 按需导入 -->
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.找卡片组件 -->
    <el-card class="box-card">
      <!-- 4. 利用布局组件调试 :gutter="20" 指每一栏之间的间隔, :span指定宽度 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 3.输入框中的搜索框结构 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <!-- 13. 点击搜索根据关键字显示列表,只需要通过v-model监听query参数, 然后再次调用getUserInfo -->
            <!-- 14. 优化用户又想看到所有数据, 找input可以清空的属性clearable, 通过监听clear再次发出getUserList -->
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 按钮组件 -->
        <el-col :span="4">
          <!-- 15. 3 绑定事件显示弹框 -->
          <el-button @click="dialogVisible=true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 6.table组件 用户列表区域 -->
      <el-table :data="userlist" border>
        <!-- 7.添加索引列 type="index" -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>

        <el-table-column label="状态">
          <!-- 8. 设置状态, 状态不需要prop属性, 可以通过作用域插槽slot-scope="scope"获取当前索引的数据, 使用模板测一下 -->
          <template slot-scope="scope">
            <!-- 8.1{{scope.row}}, 测试成功, 找到switch模板复制过来 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            <!-- 12. 用chang监听状态改变, 传作用域上的数据 -->
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <!-- 9.设置修改, 删除, 分配角色按钮 -->
          <!-- 修改  19. 点击修改, 添加template, 设置作用域 -->
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>

            <!-- 删除 25. 点击删除, 弹的是确认框, 找弹框组件, 需要按需导入. 并在原型上注册 Vue.prototype.$confirm = MessageBox.confirm -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 10. 给分配角色设置提示消息, 找tooltip组件, 问题:鼠标可以停留在tooltip的问题会遮挡上一列表的按钮, 找属性 :enterable="false" -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(scope.row)"></el-button>
              <!-- 第三. 绑定click事件 -->
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 11.分页区域 找分页组件的完整功能 -->
      <!-- page-sizes="[2, 4, 1, 7]" : 显示个数的选项列表 -->
      <!-- layout 用来定制对应的布局结构 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 1, 7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 15.添加用户的对话框 -->
    <!-- 15.1 去data中设置控制添加用户对话框的显示和隐藏 -->
    <!-- 15.2 分析完结构后给添加用户绑定click事件, 绑定完之后找16项 -->
    <!-- :visible.sync="dialogVisible"对话框的显示和隐藏  -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <!-- 17. 当关闭对话框时，重置表单 绑定@close事件 -->
      <!-- 内容主体区域 -->

      <!-- 16. 找表单组件的验证表单的前四条复制 -->
      <!-- :model 添加用户的表单对象 :rules 验证规则对象 ref 当前元素的引用名称  -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <!-- prop="username" : 验证规则中的属性 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 16.3 测试过复制, 然后自定义验证 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <!-- 点击取消和确定都可以控制对话框 -->
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
        <!-- 18. 点击添加新用户 -->
      </span>
    </el-dialog>

    <!-- 20. 设置点击修改的弹框, 重复添加弹框时的操作 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 23.设置完表单验证规则后, 监听close事件重置表单  -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
        <!-- 24.点击修改用户信息 -->
      </span>
    </el-dialog>

    <!--第一. 写完角色列表, 添加分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed" >
      <!-- 第五. 获取当前的用户信息 -->
      <div>
        <p>当前的用户 : {{ userInfo.username }}</p>
        <p>当前的角色 : {{ userInfo.role_name }}</p>
        <!-- 第八, 拷贝select选择器组件, v-model的值去data定义, 为了拿到选中的id值 -->
        <p>
          分配新角色
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <!-- 第九.其data中 定义被选中的值, 为了点击确认传参 -->
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        <!-- 第十. 点击确定绑定事件 -->
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //16.4 设置自定义校验规则
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 第二. 控制角色对话框的显示和隐藏
      setRoleDialogVisible: false,
      //第五. 存储需要被分配角色的用户信息
      userInfo: {},
      //第七. 获取用户的角色列表
      rolesList:[],
      //第九. 定义被选中的值
      selectedRoleId:'',

      //5.1 设置用户列表的参数对象
      queryInfo: {
        query: '', //查询字符串
        pagenum: 1, //默认显示第一页
        pagesize: 2 //每页显示的个数
      },
      //5.2 存储用户数据
      userlist: [],
      total: 0,
      //15.1 控制添加用户对话框的显示和隐藏
      dialogVisible: false,
      //16.1 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //16.2 添加表单的验证规则对象
      addFormRules: {
        //设置规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 16.5 调用自定义的校验规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          // 16.5 调用自定义的校验规则
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //21.控制修改对话用户框的显示与隐藏
      editDialogVisible: false,
      //22.存储根据id修改的数据
      editForm: {},
      //23. 添加表单的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //第四. 监听点击显示分配角色的对话框, 传实参, 用户信息scope.row
    async setRole(userInfo){
      //获取需要被分配的用户信息, 传参, 并渲染在页面
      this.userInfo = userInfo;
      //第六. 在展示对话框前获取所有的角色列表1.5.1
     const {data: res} = await this.$http.get('roles');
     if(res.meta.status !== 200) return this.$message.error("获取角色失败");
     //保存角色列表到data中
     this.rolesList = res.data;

      //显示
      this.setRoleDialogVisible = true;
    },
    //第十一. 监听确定按钮分配角色
    async saveRoleInfo(){
      //判断
      if(!this.selectedRoleId)return this.$message.info("请选择");
      //请求数据1.3.7接口
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid: this.selectedRoleId
      });
      if(res.meta.status !== 200) return this.$message.error('更新角色失败');

      this.$message.success('更新角色成功!');
      //再初始化数据
      this.getUserList();
      //第十二. 优化监听弹框关闭时, 重置数据, 去绑定@close事件

      this.setRoleDialogVisible = false
    },
    //第十三. 监听弹框关闭
    setRoleDialogClosed(){
      this.selectedRoleId = '',
      this.userInfo = {};
    },

    //5. 获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      //console.log(res)
    },
    //11.1.监听pagesize改变的事件
    handleSizeChange(newSize) {
      //经过打印测试, 获取最新的每页的条数, 赋值
      this.queryInfo.pagesize = newSize
      //再重新获取数据
      this.getUserList()
    },
    //11.2.监听当前页码改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //12.1.监听状态改变
    async userStateChange(userInfo) {
      // console.log(userInfo);//可以得到状态, 数据请求
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      //校验
      if (res.meta.status !== 200) {
        //重置状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    //17.1 绑定事件
    addDialogClosed() {
      //对话框关闭之后，重置表达
      this.$refs.addFormRef.resetFields()
    },
    //18.1添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid) // 获取验证的状态. 布尔值
        if (!valid) return
        //可以发起请求
        const { data: res } = await this.$http.post('users', this.addForm)
        //后台校验
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }

        this.$message.error('添加用户成功')
        // 隐藏添加用户的对话框
        this.dialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    //19.1 点击操作修改, 传id, 根据id请求数据
    async showEditDialog(id) {
      //显示弹框
      this.editDialogVisible = true
      //根据id请求数据
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      //将数据保存到data中
      this.editForm = res.data
    },
    //23.1 绑定事件重置表单
    editDialogClosed() {
      //对话框关闭之后，重置表单
      this.$refs.editFormRef.resetFields()
    },
    //24.1监听修改事件
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发起数据请求, 在editForm存了根据id获取的数据
        const { data: res } = await this.$http.put(
          `users/${this.editForm.id}`,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户失败')
        }

        //成功则关闭弹框
        this.editDialogVisible = false
        //刷新数据列表
        this.getUserList()
        //提示修改成功
        this.$message.success('更新用户成功')
      })
    },
    //25.1 点击根据id删除, 弹消息确认框, 根据官方文档按需引入
    async removeUserById(id) {
      //去官网复制代码
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }
      ).catch(err => err)
      //console.log(confirmResult) // 是promise, 通过async简化其操作, 再打印测试, 返回字符串, 点击取消报错. 用catch方法捕获去错误操作
      //如果用户点击确认，则confirmResult 为'confirm'
      //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      //console.log("你想删除");
      //发请求
      const { data: res } = await this.$http.delete('users/' + id)

      if (res.meta.status !== 200) return this.$message.error('删除失败')

      this.$message.success('删除成功')
      //刷新数据
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>