<template>
  <div id="app">
    <div class="log_con">
      <div class="login_box">
        <div class="avatar_box">
          <img src="../assets/logo.png" alt />
        </div>

        <!-- 表单区域 -->
        <el-form
          label-width="0px"
          class="login_form"
          :model="loginForm"
          :rules="loginRules"
          ref="loginRef"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              prefix-icon="iconfont icon-3702mima"
              type="password"
            ></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" round @click="login">登录</el-button>
            <el-button type="info" round @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { log } from 'util'
import { async } from 'q'
export default {
  data() {
    return {
      // 登录表单数据的绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 验证表单内容
      loginRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset() {
      this.$refs.loginRef.resetFields()
    },
    // 表单预验证
    login() {
      this.$refs.loginRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return
        // 解构赋值
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res);

        if (res.meta.status !== 200) {
          return this.$message.error('登录失败')
        }
        this.$message.success('登陆成功')
        // console.log(res); //将token令牌存放在sessionStorage中

        window.sessionStorage.setItem('token', res.data.token)
        // 编程式导航跳转页面
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.log_con {
  height: 100%;
  background-color: rgb(8, 76, 143);
}
.login_box {
  background-color: #fff;
  width: 450px;
  height: 300px;
  border-radius: 8px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
