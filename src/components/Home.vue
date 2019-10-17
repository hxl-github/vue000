<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="..//assets/heima.png" alt />
        <span>黑马后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
        <!-- 侧边栏 -->
      <el-aside :width="isCollapse?'64px':'200px'">
          <!-- 折叠按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="lightblue"
          text-color="#fff"
          active-text-color="yellow"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="$route.path"
        >
        
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">

            <template slot="title">
              <i :class="iconsAll[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subitem.path" :key="subitem.id" v-for="subitem in item.children">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menulist: [],
      iconsAll: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse:false
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取左侧菜单数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200)
        return this.$message.error('获取菜单数据失败')
      this.menulist = res.data
      //   console.log(res);
    },
    toggleCollapse(){
        this.isCollapse=!this.isCollapse
    }

  },
  //生命周期函数
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.iconfont {
  margin-right: 10px;
}
.home_container {
  height: 100%;
  .el-header {
    background-color: lightblue;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
    }
    img {
      margin-right: 15px;
    }
  }
  .el-aside {
    background-color: lightblue;
    .el-menu {
      border-right: 0;
    }
    
  }
  .toggle-button {
        background-color: lightseagreen;
        font-size: 10px;
        line-height: 24px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
  .el-main {
    background-color: pink;
  }
}
</style>