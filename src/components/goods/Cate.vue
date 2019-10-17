<template>
    <div>
         <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <el-row><el-col><el-button type="primary" @click='showAddCateDialog'>商品添加</el-button></el-col></el-row>
        
     
     <!-- 表格区域 -->
     <tree-table  class="treeTable"  :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" 
        show-index index-text="#" border :show-row-hover="false"  >
        <template slot="isok" slot-scope="scope">
         <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen" ></i>
         <i class="el-icon-error"  style="color:red" v-else></i>
         </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
         <el-tag type="primary" v-if="scope.row.cat_level===0">一级</el-tag>
         <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
         <el-tag type="warning" v-else>三级</el-tag>
         </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>

    </tree-table>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 商品添加对话框 -->
    <el-dialog title="添加分类" :visible.sync="adddialogVisible" width="50%" @close="adddialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称">
            <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader :options="parentCateList" :props="cascaderProps"
           v-model="selectedKeys" 
          @change="parentCateChanged" clearable >
          </el-cascader>
        </el-form-item>
       
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AdduserBtn">确 定</el-button>
      </span>
    </el-dialog>
    </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return {
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            cateList:[],
            total:0,
            // 为table指定列的定义
         columns: [
            {
          label: '分类名称',
          prop: 'cat_name'
        },{
          label: '是否有效',
          type:'template',
        template: 'isok'
        },{
          label: '等级',
          type:'template',
        template: 'order'
        },{
          label: '操作',
          type:'template',
        template: 'opt'
        }],
        //添加的表单
        addForm: {
        cat_name: '',
        cat_level: 0,
        cat_pid:0
        
      },
      adddialogVisible:false,
      //添加表单的验证规则
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
          { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'blur' }
        ]
      },
      //父级列表
      parentCateList:[],
    cascaderProps:{
       value: 'cat_id',
        label: 'cat_name',
        children: 'children',
         expandTrigger:'hover',
         checkStrictly:true
    },
     // 选中的父级分类的Id数组
      selectedKeys: [],
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        //获取分类列表数据
       async getCateList(){
        const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.erro('获取失败')
      }
      this.cateList = res.data.result
      console.log(this.cateList);
      
      this.total = res.data.total
    },
    //监听每页显示条数
    handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize
        this.getCateList()
    },
    //监听当前页函数
    handleCurrentChange(newNum){
        this.queryInfo.pagenum=newNum
        this.getCateList()
        },
        //监听关闭对话框的关闭事件 用close事件
    adddialogClose() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys=[]
      this.addForm.cat_pid=''
      this.addForm.cat_level=''
      console.log(this.addForm);
      
    },
    //监听确定按钮添
    AdduserBtn() {
      this.$refs.addFormRef.validate(async val => {
        // console.log(val) //返回一个布尔值
        if (!val) return
        //调用接口发送请求
        const { data: res } = await this.$http.post('categories', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品分类失败！')
        }
        this.$message.success('添加成功')
        this.adddialogVisible = false
        this.getCateList()
      })
    },
    //显示对话框事件
    showAddCateDialog(){
        this.adddialogVisible=true
        //显示的时候获取父级
        this.getParentCateList()
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

    //   console.log(res.data)
      this.parentCateList = res.data
    },
    //选择项发生变化时触发
    parentCateChanged(){
        if(this.selectedKeys.length>0){
            // 添加父级id
            this.addForm.cat_pid= this.selectedKeys[
          this.selectedKeys.length - 1
        ]
            //添加 等级
            this.addForm.cat_level=this.selectedKeys.length
    }
    console.log(this.addForm);
    
    }

    }
}
</script>
<style lang="less" scoped>
.treeTable {
    margin-top: 20px
}
</style>