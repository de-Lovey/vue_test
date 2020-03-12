<template>
  <div>
    <!-- 1.去user.vue导入面包屑组件结构 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 2.卡片式图 -->
    <el-card>
      <!-- 3.复制Alter警告组件的第一组的第二个 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 4.复制Steps步骤条的第二组, 再设置title和样式, 注: 一定要去全局样式中设置样式 -->
      <!-- :active指定激活项的索引, 5. 去js中定义一下activeIndex -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 8.因为添加商品数据在不同的面板中, 需要form表单把整个tabs包裹起来,复制带有验证表单的第一行 注: 不能拆分tabs和tabs-pane -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="ruleFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- label-position="top" : 指定label在文本框之上 -->
        <!-- 6.复制tabs竖向的结构 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 7.更改label显示的文本后, 实现商品联动: 分析后, 通过name设置对应的索引, 通过v-model绑定你点击时对应的索引,即可以直接绑定到activeIndex这个属性上,让他们公用一个属性, 而步骤条中的active必须是number属性, 使用 activeIndex - 0方法 -->
          <el-tab-pane label="基本参数" name="0">
            <!-- 10. 根据要提交的参数,设置prop属性, 和设置验证对象 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <!-- type="number" :规定类型 -->
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 12.复制级联选择器, v-model="addForm.goods_cat"根据添加商品的提交参数而定数组名, 记得去data中的addForm定义一下 -->
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 18.渲染表单item项数据 -->
            <el-form-item v-for="item in manyTableData" :label="item.attr_name" :key="item.attr_id">
              <!-- 20.复制checkBox组件的多选框组, 重置margin的样式 -->
              <!-- v-model="item.attr_vals"绑定的数组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(item2, i) in item.attr_vals" :label="item2" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 22.遍历静态属性 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 23.复制Upload图片列表缩略图结构 -->
            <!-- action:表示图片要上传到后台的api地址,在data中定义, 然后再定义两个事件,  list-type="picture" 定义文件的类型-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <!-- 26.梳理完结构之后测试, 打开network, 点击上传之后在network接口中显示无效的token值, 分析:因此操作并没有通过axios设置, 不会自动的设置请求头的token值, 需要借助headers属性设置请求头对象 -->
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 38.下载运行依赖,富文本插件vue-quill-editor, 打开详情进入github, 去main.js导入, 复制组件结构, 去全局设置高度 -->
            <quill-editor  v-model="addForm.goods_introduce" />
            <!-- 使用v-model绑定添加商品接口地址的参数, 介绍参数, 去data定义 -->
            <!-- 39.添加商品按钮 -->
            <el-button type="primary" style="margin-top:15px;" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 35.Dialog弹框的基本结构, 定义previewVisible : false -->
    <el-dialog title="提示" :visible.sync="previewVisible" width="50%">
      <!-- 36.设置img图片 -->
      <img :src="previewPath" alt style="width:100%;" />
      <!-- 37.去预览函数中设置 this.previewVisible = true, 打开弹框-->
    </el-dialog>
  </div>
</template>

<script>
////官方推荐将lodash导入为_
import _ from 'lodash'
export default {
  data() {
    return {
      //5.定义步骤条的默认选中的索引
      activeIndex: '0',
      //9.添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所选的分类数组
        goods_cat: [],
        //图片数组
        pics: [],
        //商品介绍
        goods_introduce:'',
        //商品参数
        attrs:[]

      },
      //验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择三级商品分类', trigger: 'change' }
        ]
      },
      //分类列表数据
      catelist: [],
      //级联选择器的配置项
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTableData: [],
      //上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //预览图片路径
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //11.获取商品分类列表1.6.1, 不需要传参
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      //成功则保存到data中
      this.catelist = res.data
      //   console.log(this.catelist)
    },
    //13.级联选择器变化触发的函数
    handleChange() {
      console.log(this.addForm.goods_cat)
      //14.判断只能选择三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
    },
    //14. 监听标签页切换的行为, 通过在组件的属性中分析完之后, 给tab添加beforeTabLeave属性
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将离开标签页的名字是:"+ oldActiveName);
      // console.log("即将进入标签页的名字是:"+ activeName);
      // return false; //测试: 使用这个阻止切换
      //判断如果是一个面板, 且未选择三级分类
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    //15.通过文档给tab标签@tab-click="tabClicked"绑定, 监听tab被选中时触发
    async tabClicked() {
      // console.log(this.activeIndex);//拿到对应的name值
      //判断: 如果等于1, 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        //16.发请求 : 1.7.1, 该参数列表默认应该为动态参数
        //分类id建议用计算属性获取
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数列表失败！')
        //成功, 则保存到data中
        //   this.manyTableData = res.data;
        //19. 每一个item项都有对应的多个标签,要遍历的渲染, 需要把字符串的attr_vals转换成数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data

        //18.去结构中渲染数据
      } else if (this.activeIndex === '2') {
        //21.判断面板是商品属性时. 发请求获取静态属性数据, 复制上面的接口, 改params中的参数为only
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200)
          return this.$message.error('获取静态属性失败！')
        //成功则保存在data中
        this.onlyTableData = res.data
        //22.去结构中渲染数据
      }
    },
    //24.处理图片的预览效果
    handlePreview(file) {
      //34.预览接收形参, 获取绝对路径, 定义在data中, 因为要把路径设置在弹框中
      this.previewPath = file.response.data.url
      //35.去赋值Dialog弹框
      //37.点击打开弹框
      this.previewVisible = true
    },
    //25.处理移除图片的操作
    handleRemove(file) {
      //31. 移除图片, 根据文档接收第一个形参, 打印
      //console.log(file); //获取将要删除的临时路径
      const filePath = file.response.data.tmp_path
      //32.从pics数组中找到对应的索引值
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)
      //33. 通过splice删除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    //27.监听图片上传成功的事件, 拿到图片的地址
    handleSuccess(res) {
      // console.log(res);
      //28. 在data中的addForm对象中定义和后台一致的参数pics:[]
      //29. 根据接口分析: 要拼接得到一个对象
      const picInfo = { pic: res.data.tmp_path }
      //30.追加到addForm.pics中, 再测试
      this.addForm.pics.push(picInfo)
    },
    //40. 点击添加商品
    add(){
        // console.log(this.addForm);//测试
        this.$refs.ruleFormRef.validate(async valid =>{
            if(!valid) return this.$message.error("请填写必要的表单项");
            //执行添加的业务逻辑
            //41. 根据分析接口, 分类数组, 改造成字符串
            // this.addForm.goods_cat = this.addForm.goods_cat.join(',');
            //42.测试后会报错, 因为级联选择器使用v-model绑定的数据只能是数组类型, 所以可以使用深拷贝, 下载开发依赖lodash, 有一个cloneDeep()方法, 局部导入lodash插件, 调用
            const form = _.cloneDeep(this.addForm);
            form.goods_cat = form.goods_cat.join(',');
            //打印测试
            // console.log(form);
            //43. 根据添加商品的接口, 处理动态参数, 去data中定义addForm的属性为attrs
            this.manyTableData.forEach(item =>{
                //拼接新对象, 再push进去
                const newInfo = {
                    attr_id: item.attr_id,
                    attr_value: item.attr_vals.join(',')
                }
                this.addForm.attrs.push(newInfo);
            })

            //44. 处理静态属性
            this.onlyTableData.forEach(item =>{
                //拼接新对象, 再push进去
                const newInfo = {
                    attr_id: item.attr_id,
                    attr_value: item.attr_vals
                    //静态属性的value值就是一个字符串
                }
                this.addForm.attrs.push(newInfo);
            });
            //45. 再赋值给form
            form.attrs = this.addForm.attrs;
            //46.请求数据, 添加商品 1.8.2
            const {data: res} = await this.$http.post('goods', form);
            if(res.meta.status !== 201) return this.$message.error("添加商品失败");
            //成功
            this.$message.success("添加商品成功");
            //跳转
            this.$router.push('/goods');


        })
    },
  },
  computed: {
    //17.通过计算属性获取分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
//若此框架中没这个样式, 可以在局部设置
.el-steps {
  margin: 15px 0;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

// 全局样式
.el-step__title {
  font-size: 13px;
}
</style>