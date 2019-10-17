<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="28">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="queryUser">
            <el-button slot="append" icon="el-icon-search" @click="queryUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="adddialogVisible=true">用户添加</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="编号"></el-table-column>
        <el-table-column prop="username" label="用户名称"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserByid(scope.row.id)"
            ></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-setting"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="adddialogVisible" width="50%" @close="adddialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="AdduserBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户信息的对话框 -->
    <el-dialog title="编辑用户信息" :visible.sync="editDilog" width="50%" @close="editClosed">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDilog = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色分配对话框 showRoleDialog-->
    <el-dialog title="分配角色" :visible.sync="showRoleDialog" width="50%" @close="setRoleClose">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList "
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="sureSetRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    // 验证邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    // 验证手机号
    var checkMobile = (rule, value, cb) => {
      // const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      const regMobile = /^1[3-9][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      adddialogVisible: false,
      //添加表单的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15  个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      //修改按钮的对话框隐藏
      editDilog: false,
      //查询到的用户信息对象
      editForm: {},
      //编辑按钮验证规则
      editRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      //获取当前用户的信息
      userInfo: {},
      //角色分配的对话框
      showRoleDialog: false,
      rolesList: [],
      //选中当前的角色id
      selectedRoleId: ''
    }
  },
  created() {
    this.queryUser()
  },
  methods: {
    async queryUser() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.erro('获取失败')
      }
      this.userlist = res.data.users
      //   console.log(this.userlist)
      this.total = res.data.total
    },
    //监听每页显示几条
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize
      //重新获取数据
      this.queryUser()
    },
    //监听当前页码
    handleCurrentChange(newNum) {
      // console.log(newNum);
      this.queryInfo.pagenum = newNum
      // 重新获取数据
      this.queryUser()
    },
    //用户状态修改
    async changeState(userinfo) {
      // console.log(userinfo);//用change 注册事件
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      userinfo.mg_state = !userinfo.mg_state
      if (res.meta.status !== 200) {
        return this.$message.error('用户更新状态失败！')
      }
      this.$message.success('用户更新状态成功')
    },

    //监听关闭添加用户对话框的关闭事件 用close事件
    adddialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //监听确定按钮添加用户
    AdduserBtn() {
      this.$refs.addFormRef.validate(async val => {
        console.log(val) //返回一个布尔值
        if (!val) return
        //调用接口发送请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败！')
        }
        this.$message.success('添加成功')
        this.adddialogVisible = false
        this.queryUser()
      })
    },
    //显示编辑对话框
    async showEditDialog(id) {
      // console.log(id); 将id传过来
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      //如果没有出错就将查询到的用户信息进行保存到data
      this.editForm = res.data
      //点击编辑按钮弹出对话框
      this.editDilog = true
    },
    //监听修改用户对话框的关闭事件
    editClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改表单的预验证并提交..............
    editUserInfo() {
      this.$refs.editFormRef.validate(async val => {
        console.log(val)
        if (!val) return
        //结果是true 就发起请求编辑用户提交
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('提交信息失败')
        }

        //关闭对话框
        this.editDilog = false
        //刷新列表
        this.queryUser()
        //提示修改成功
        this.$message.success('提交信息成功')
      })
    },
    //根据id删除
    async removeUserByid(id) {
      // console.log(id);
      const Res = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      console.log(Res)
      if (Res != 'confirm') {
        return this.$message.info('已取消')
      }
      //否则就确认删除 发送请求
      const { data: res } = await this.$http.delete('users/' + id)
      console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.queryUser()
    },
    //显示角色分配对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      this.showRoleDialog = true
      //调用接口获取数据
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    //点击分配角色确定按钮 调用接口实现修改角色
    async sureSetRole() {
      //如果没有选择角色id就提示
      if (!this.selectedRoleId) {
        return this.$message.error('请选择相应角色！')
      }

      //如果有就 实现修改
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色失败')
      }
      this.$message.success('修改角色成功')
      this.queryUser()
      this.showRoleDialog = false
    },
    //对话框重置
    setRoleClose() {
      ;(this.selectedRoleId = ''), (this.rolesList = [])
    }
  }
}
</script>
<style lang="less" scoped>
</style>