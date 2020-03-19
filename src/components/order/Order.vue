<template>
  <div>
    <!-- 1.面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
            <!-- 3.复制带有搜索的Input框组件 -->
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 5. 渲染订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
            <!-- 6.渲染完表格列, 再通过作用于插槽设置对应的信息 -->
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">
            <template>
              {{scope.row.is_send}}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
              <!-- 8.点击修改, 展示对话框 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
            <!-- 15.监听点击显示物流的弹框 -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 7. 分页区域 , 再监听两个事件-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 9. 复制Dialog的弹框, 修改地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
        <!-- 12. 监听弹框关闭事件 -->
        <!-- 10.表单组件, 定义表单数据对象, 验证规则, -->
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
        <!-- 11. 设置级联选择器, 导入citydata.js, 并在data中接收导入进来的数据 -->
          <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 14. 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 18.时间线 timestamp:设置时间 -->
      <!-- 19.去style中导入那两个css样式
       -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
//11. 导入citydata.js
import cityData from './citydata.js'

export default {
  data() {
    return {
        //订单参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      //12. 定义cisyData数据(简写)
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
      //4. 获取订单数据列表1.10.1
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo //定义接口参数
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      //成功则保存
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 8.点击修改,展示修改地址的对话框
    showBox() {
      this.addressVisible = true
    },
    //12. 监听弹框关闭事件, 清空数据
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
      //13.点击修改地址没有设计接口, 就暂时不实现了
    },
    //15.监听点击显示物流的弹框
    async showProgressBox() {
        //17.调接口 1.10.5, 使用测试物流订单
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      //成功返回的是数组
      //注意: 这是测试物流订单, 所以说是随机的数组, 我们目前只需要把数组渲染在弹框中
      //① 去官网找Timeline时间线组件, 去更新日志寻找TImeline的新增时间, 是2.6.0,是2019.3月份才更新
      //② 再去vue/ui中的插件找vue-cli-plugin-element, 点击查看详情, 在右边有一个当前版本的更新时间: 2019.1.9
      //③ 从而得知: 该版本没有这个组件, 所以赋值素材中的两个文件夹到plugins中, 在element.js中导入这两个拓展组件, 再全局注册
      //④ 再通过官网复制其结构渲染
      this.progressInfo = res.data
      //16. 显示弹框
      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

.el-cascader {
  width: 100%;
}
</style>
