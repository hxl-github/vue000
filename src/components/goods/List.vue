<template>
    <div>
        <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 搜索框区域 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input  placeholder="请输入内容" v-model="queryInfo.query"
                 class="input-with-select" clearable @clear='getGoodsList'>
                 <el-button slot="append" icon="el-icon-search"  @click='getGoodsList'>
                </el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type='primary' @click="AddGoods" >添加商品</el-button>
            </el-col>
        </el-row>
    

     <!-- 表格区域 -->
        <el-table :data='goodslist' border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name"></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
            <el-table-column label="创建时间" prop="add_time" width="160px">
                <template slot-scope="scope">{{scope.row.add_time | dateForm}}</template>
            </el-table-column>
            <el-table-column label="操作" width="180px" >
                <template slot-scope="scope" >
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click='removeGoods(scope.row.goods_id)'>删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 20, 40]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper" background
      :total="total">
    </el-pagination>
    </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return {
          //查询参数对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            //商品列表
            goodslist:[],
            //总数组条数
            total:0
        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        //获取商品列表数据
         async  getGoodsList(){
        const {data:res}=await this.$http.get('goods',{params:this.queryInfo})
        if(res.meta.status!==200) return this.$message.error('获取商品列表失败')
        this.goodslist=res.data.goods
        this.total=res.data.total
        console.log(this.goodslist);
        console.log(this.total);
        
        },
        //监听每页的条数变化
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this. getGoodsList()

        },
        //监听当前页的变化
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum
               this. getGoodsList()
        },
        //删除按钮实现删除商品
      async  removeGoods(id){
            const confirmResult=await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        
        if(confirmResult!=='confirm') return this.$message.info('已取消删除')
        //如果确认删除就调用接口 实现删除功能
        const {data:res}=await this.$http.delete(`goods/${id}`)
        if(res.meta.status!==200){return this.$message.error('删除商品失败')}
        this.$message.success('删除商品成功！')
        this.getGoodsList()
        },
        //点击商品添加通过编程式导航实现跳转页面
        AddGoods(){
            this.$router.push('/goods/add')
        }

      
    }
}
</script>
<style lang="less" scoped>

</style>