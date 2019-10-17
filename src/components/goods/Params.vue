<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>参数管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 商品参数 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <!-- 三级联动框 -->
          <el-cascader
            :options="catelist"
            :props="props"
            v-model="selectedCateKeys"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="adddialogVisible=true"
          >添加参数</el-button>

          <!-- 动态参数表格区域 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="编号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="adddialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <!-- 动态参数表格区域 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>

                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="编号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 表单区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类列表
      catelist: [],
      //级联选择框的配置对象
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //被激活的页签名称
      activeName: 'many',
      onlyTableData: [],
      manyTableData: [],
      //控制添加对话框的隐藏和显示
      adddialogVisible: false,
      addForm: {
        attr_name: ''
      },
      //添加对话框表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editdialogVisible: false,
      //编辑对话框表单校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入修改内容', trigger: 'blur' }
        ]
      },
      //编辑获取数据
      editForm: {
        attr_name: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    //如果按钮需要禁用，则返回true 否则返回false
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3 ? true : false
    },
    //选中三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
      console.log(this.selectedCateKeys[2])
    },
    //判断文本该显示那个
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
    },
    //级联选择框变化会触发的事件
    handleChange() {
      this.getParamsData()
    },

    // 切换tabs
    handleClick() {
      this.getParamsData()
    },
    //封装参数函数
    async getParamsData() {
      //控制选中的必须是三级分类
      //如果不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      //如果选中是三级分类
      console.log(this.selectedCateKeys)
      //选中的是三级分类 然后就可以根据所选分类id和所在的面板获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      //   console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      //将获得的数据遍历以后 用空格隔开然后变成一个新的数组 然后利用作用域插槽数组中的数据渲染进去
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

        //控制文本框和按钮的切换显示
        item.inputVisible = false
        //文本框中输入的内容
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    //点击确认调用接口完成添加
    addParams() {
      //预验证 然后调用接口
      const result = this.$refs.addFormRef.validate(async val => {
        if (!val) return

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.addForm.attr_name, attr_sel: this.activeName }
        )
        console.log(res)

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.adddialogVisible = false
        this.getParamsData()
      })
    },
    //重置添加属性的对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //显示编辑对话框事件
    async showEditDialog(attr_id) {
      console.log(attr_id)

      this.editdialogVisible = true
      // 根据id 查询参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数失败')
      }
      this.editForm = res.data
      this.editdialogVisible = true
    },
    //编辑对话框重置事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //编辑对话框确认按钮
    editParams() {
      //发起表单的预校验 如果成功就 请求修改的接口
      this.$refs.editFormRef.validate(async val => {
        if (!val) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_sel: this.activeName, attr_name: this.editForm.attr_name }
        )
        // console.log(res);
        if (res.meta.status != 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editdialogVisible = false
        this.getParamsData()
      })
    },
    //删除按钮注册事件
    async removeParams(attr_id) {
      //首先弹出框确认是否删除
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      //如果没有取消删除就调用接口执行删除逻辑
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    //文本框失去焦点或者按下enter键会触发的事件
    handleInputConfirm(row) {
      //如果用户输入的是空格就让重置成空字符串并隐藏输入框
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果用户输入内容合法就获取文本框中 的值并将其push到attr_vals数组中
      row.attr_vals.push(row.inputValue.trim())
      //重置输入框并隐藏
      row.inputValue = ''
      row.inputVisible = false
      //发起请求 将修改的参数提交到后台保存
      this.saveAttrVals(row)
    },
    //封装修改参数后提交后台的函数  添加的时候用到删除也用到
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error('更新参数失败')
      this.$message.success('更新参数成功')
    },

    //点击按钮就可以让文本框显示出来
    showInput(row) {
      console.log(row)
      row.inputVisible = true
      //让文本框自动获得焦点
      //$nextTick 作用就是等页面上的数据被重现渲染后 才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //删除属性tag
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  margin: 15px;
}
.el-tag {
  margin: 0 8px 8px 0;
}
.input-new-tag {
  width: 120px;
}
</style>
