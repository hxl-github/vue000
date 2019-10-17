<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条区域  -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <!-- 实现tab栏与步骤的联动效果   -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品分类" prop="goods_cat" type="number">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="getcatelist"
                :props="cateProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-form-item label="商品信息" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 每个属性名下面的内容 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染静态属性的ui界面 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片要上传到后台api地址  注意要action是属性要绑定属性 -->
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!--添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewUrl" alt class="previewPic" />
    </el-dialog>
  </div>
</template>
<script>
//引入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      //获取添加商品对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        //存储上传图片的临时路径
        pics: [],
        goods_introduce: ''
      },
      //获取添加商品规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //接口获取的商品数据放到data中保存
      getcatelist: [],
      ///级联选择器定义对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
        // checkStrictly: true
      },
      //获取动态参数数组
      manyTableData: [],
      //获取静态属性数组
      onlyTableData: [],
      //图片上传的地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片具体路径
      previewUrl: '',
      //图片对话框
      previewVisible: false
    }
  },
  computed: {
    cateId() {
      return this.addForm.goods_cat.length !== 3
        ? null
        : this.addForm.goods_cat[2]
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数组
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.getcatelist = res.data
      // console.log(this.getcatelist)
    },
    //级联选择发生变化时触发事件
    handleChange() {
      // console.log(this.addForm.goods_cat)
      //  控制级联选择器的选择范围
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = [])
      }
    },
    //
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择三级商品分类！')
        return false
      }
    },
    //点击左侧tab栏右侧相应获取数据
    async tabClick() {
      //获取动态参数
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } }
        )
        console.log(res)

        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败')
        //先将里面的字符串分割成数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      }
      //获取静态属性
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } }
        )
        console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error('获取动态参数失败')

        this.onlyTableData = res.data
        console.log(this.manyTableData)
      }
    },
    //图片预览函数
    handlePreview(file) {
      this.previewUrl = file.response.data.url
      this.previewVisible = true
    },
    //图片删除函数
    handleRemove(file) {
      console.log(file)
      //首先拿到图片的临时路径
      const temPath = file.response.data.tmp_path
      const i = this.addForm.pics.indexOf(x => x.pic === temPath)
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    //图片上传成功获得数据
    handleSuccess(response) {
      // console.log(response);
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    addGoods() {
      //表单预验证
      this.$refs.addFormRef.validate(async val => {
        if (!val) {
          return this.$message.error('请填写表单的必要选项')
        }
        //执行添加业务
        // 首先要深拷贝 一份addForm对象 用到依赖lodash
        const form = _.cloneDeep(this.addForm)
        //将数组转化为用逗号分隔的字符串
        form.goods_cat = form.goods_cat.join(',')
        //  console.log(form);
        //动态参数
        form.attrs = []
        for (var i = 0; i < this.manyTableData.length; i++) {
          const item = this.manyTableData[i]
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          })
        }
        //静态属性
        for (var i = 0; i < this.onlyTableData.length; i++) {
          const item = this.onlyTableData[i]
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        }
        // console.log(form)
     
      //发起请求
    const {data:res}=await this.$http.post('goods',form) 
    // console.log(res);
    if(res.meta.status!==201){return this.$message.error('商品添加失败')}
    this.$message.success('商品添加成功')
    this.$router.push('/goods')
     })
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 8px 0 0 !important;
}
.previewPic {
  width: 100%;
}
.btnAdd {
  margin-top: 10px;
}
</style>