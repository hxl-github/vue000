<template>
    <div>
     <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <el-button type="primary">角色添加</el-button>

        <!-- 表格区域 -->
         <el-table :data="rolesList" stripe border>
        <el-table-column type="expand" >
            <template slot-scope='scope'>
                <el-row :class="['bBottom',i1=='0'?'bTop':'','vcenter']" v-for='(item1,i1) in scope.row.children' :key='item1.id'>
                    <!-- 渲染一级权限 -->
                    <el-col :span='5'>
                        <el-tag type="primary" closable
                    @close='removeRight(scope.row,item1.id)'>{{item1.authName}}</el-tag>
                         <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染二级和三级权限 -->
                     <el-col :span="19">
                  <!-- 通过for循环 嵌套渲染二级权限 -->
                 <el-row
                :class="[i2===0?'':'bTop','vcenter']"
                v-for="(item2,i2) in item1.children"
                :key="item2.id"
              >
                <el-col :span="6">
                  <el-tag type="success" closable
                    @close='removeRight(scope.row,item2.id)'>{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 三级权限 -->
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="(item3,i3) in item2.children"
                    :key="item3.id"
                    closable
                    @close='removeRight(scope.row,item3.id)'
                  >{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column  label="操作" width="300px">
            <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
            >编辑
            </el-button>
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
            >删除
            </el-button>
            <!-- 分配权限按钮 -->
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting "
              @click='showRightDialog(scope.row)'
            >分配权限
            </el-button>
            </template>
        </el-table-column>
        </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="rightsdialogVisible"
  width="50%"
  @close='rightsDialogClose'
    >
  <!-- 树形控件 -->
  <el-tree :data="rightsList" :props="treeProps"  show-checkbox default-expand-all node-key='id'
  :default-checked-keys='checkedId' ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="rightsdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setRight">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return{
            rolesList:[],
            rightsdialogVisible:false,
            rightsList:[],
            treeProps:{
                children:'children',
                 label:'authName'
            },
            //获取的id
            checkedId:[],
            //
            roleId:''
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
       async getRolesList(role){
          const {data:res}=await this.$http.get('roles')
          if(res.meta.status!==200){return this.$message.info('获取角色列表失败')}
            this.rolesList=res.data
            console.log(this.rolesList);
           
        },
        //删除角色权限
      async  removeRight(role,rightId){
          const result= await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        // console.log(result);
        if(result!=='confirm'){return this.$message.info('已取消')}
        //否则就确认删除  调用接口实现删除功能
        const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200){return this.$message.error('删除角色权限失败')}
        this.$message.success('删除角色权限成功')
        role.children=res.data
    },
    //显示分配权限对话框
   async showRightDialog(role){
       //将id 保存下来
       this.roleId=role.id
        const {data:res}=await this.$http.get('rights/tree')
          if(res.meta.status!==200){return this.$message.error('获取角色列表失败')}
            this.rightsList=res.data,
            this.rightsdialogVisible=true
             // 递归获取三级节点的id
            this.defaultKey(role,this.checkedId)
    },
    //通过递归的方式获取角色下所有的三级权限id，将其push到checkedId数组中
    defaultKey(node,arr){
        //如果没有下一级
       if(!node.children) {
        return arr.push(node.id)
    }
    //如果不是三级节点 就继续递归
    node.children.forEach(item=>{
      this.defaultKey(item,arr)
    })
    },
    //监听角色对话框关闭事件
    rightsDialogClose(){
      //当对话框关闭时就让checkedId中的三级权限id清空
      this.checkedId=[]
    },
    //分配权限管理
   async setRight(){
        //将选中的所有节点的id保存下来
        const keys=[...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()]
        console.log(keys);
        
        const idStr=keys.join(",")
        const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status!==200){return this.$message.error('修改权限失败')}
        console.log(res);
    
        this.$message.success('修改权限成功')
        this.rightsdialogVisible=false
        this.getRolesList()
    }
    



 }
}
</script>

<style lang="less" scoped>
    .el-tag  {
        margin:7px;
    }
    .bBottom {
    border-bottom:1px solid #ccc 
    }
    .bTop{
        border-top:1px solid #ccc 
    }
    .vcenter {
        display: flex;
  align-items: center;
    }
</style>