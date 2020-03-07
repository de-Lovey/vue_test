<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片式图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--4.渲染角色列表区域 ,el-table-column渲染列  -->
      <el-table :data="rolelist" border stripe>
        <!-- 6. 添加展开列 -->
        <el-table-column type="expand">
          <!-- 7.使用作用于插槽 -->
          <template slot-scope="scope">
            <!-- 8.使用pre标签格式化数据, 因为要分析这些数据,需要嵌套三个for循环 -->
            <!-- <pre>{{scope.row}}</pre> -->
            <!-- 9.渲染展开列 -->
            <el-row
              :class="['bdbottom', i1==0?'bdtop':'', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 12. 添加样式和小图标美化 -->
              <!-- 10.一级权限 -->
              <el-col :span="5">
                <!-- 22. 测试删除三级权限,只需要复制这个事件更改id, 就可以删除一级和二级权限 -->
                <el-tag closable @close="removeRights(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 11.渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 13. 通过for嵌套渲染二级权限 -->
                <el-row
                  :class="[ i2==0?'':'bdtop' , 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRights(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 14.渲染三级权限 -->
                    <el-tag
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRights(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag>
                    <!-- 16. 添加关闭小图标closable属性 -->
                    <!-- 17.去组件查看点击关闭图标触发事件@close -->
                  </el-col>
                </el-row>
                <!-- 15.优化样式细节 ①去全局样式里给body设置min-width: 1366px; ② 给el-row添加vcenter类垂直对齐 -->
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <!-- 5.使用作用于插槽 -->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">编辑</el-button>
            <!-- 23. 点击分配权限 -->
            <el-button
              @click="showSetRightDialog(scope.row)"
              size="mini"
              type="warning"
              icon="el-icon-setting"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 38. 点击其他的分配权限按钮, 遗留了上一次的id数据, 要监听对话框关闭事件 @close -->
    <!-- 25.复制Dialog组件的代码 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="30%"
      @close="setRightsDialogClosed"
    >
      <!-- 30. 去Tree树形控件组件复制结构,data指定数据源,  通过props指定对应的树形绑定对象, 根据官网分析对象里面的值 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 32. 添加复选框树形show-checkbox , 使用default-expand-all 默认展开所有子节点 , 使用default-checked-keys设置默认选中的节点数组名defKeys :[105, 116]测试, 使用node-key="id" 里指定唯一id标识符-->

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
        <!-- 40. 点击确定实现角色授权 -->
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist: [],
      //26. 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      //29. 存储所有权限数据
      rightsList: [],
      //31. 树形控件的树形绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //33. 默认选中的节点的id值数组
      //   defKeys:[ 105, 116 ],
      //经过测试, 只需要获取权限3的所有id, 并放到数组里,所以要定义递归方法
      defKeys: [],
      //储存角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 3.获取所有角色的列表1.5.1
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
    },
    //18.根据id删除对应权限,等会传， 实参: scope.row, item3.id
    async removeRights(role, rightId) {
      //19. 弹框提示用户是否删除, 找组件messageBox的确认消息框复制
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('取消了删除')

      //20.调接口1.5.7, 传角色id 和权限id
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')

      this.$message.success('删除成功')

      //21. 需要再次渲染新的权限列表, 不建议再次调用获取角色列表的方法, 因为删除后, 他会返回新的权限数据, 只需重置赋值即可
      role.children = res.data;
      //22,只需要复制这个事件更改id, 就可以删除一级和二级权限, 去html中绑定
    },
    //24. 点击展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;// 点击确认时, 储存角色id再写

      //27.重置为true, 建议这一行放置在后面
      // this.setRightDialogVisible = true;
      //28. 调用接口获取所有权限数据1.4.1
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
        return this.$message.error('获取权限数据失败')

      //将数据保存到data中
      this.rightsList = res.data

      //37.调用递归函数, 在showSetRightDialog传实参scope.row, role形参接收
      this.getLeafKeys(role, this.defKeys);
      // <!-- 38. 点击其他的分配权限按钮, 遗留了上一次的id数据, 要监听对话框关闭事件 @close -->

      this.setRightDialogVisible = true;// 显示弹框
    },
    //34. 通过递归的函数形式, 获取角色下的所有三级权限id,保存到defKeys
    getLeafKeys(node, arr) {
      //35. 判断这个节点是不是三级节点,根据有没有children
      if (!node.children) {
        return arr.push(node.id)
      }

      // 如果有children属性, 不是三级权限, 再遍历的调用自己
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
      //36. 调用在点击分配权限里
    },
    //39. 监听分配权限对话框的关闭事件
    setRightsDialogClosed() {
      this.defKeys = [] //重新赋值
    },
    //41. 点击确认分配角色授权
    async allotRights() {
      // 根据传参分析, 需要传一二三级权限的id, 需要调用tree组件的两个方法, 而获取, 在el-tree标签中设置ref="treeRef"获取引用对象, 利用扩展运算符合并数组
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //42. 拼接
      const idStr = keys.join(',')
      //43. 调接口,传角色id, 点击展示对话框时保存id到data中
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {  rids: idStr } )

      if (res.meta.status !== 200) return this.$message.error('分配权限失败')

      this.$message.success('分配权限成功')
      //初始化数据
      this.getRolesList()
      //关闭弹框
      this.setRightDialogVisible = false;
      //截止到43. 完成Users.vue中的分配角色
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>