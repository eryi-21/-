<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 为首页添加路由跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clearable清空输入框 clear事件在清空时触发-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button icon="el-icon-search" @click="getUserList" slot="append"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <!-- border表示带边框, stripe表示隔行变色 data绑定列表数据,绑定后再这个组件中可以直接使用绑定数据中的属性-->
      <el-table :data="userList" border stripe>
        <!-- type="index"代表有序列号 prop绑定相应的值-->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!--这里的scope.row是userList -->
          <template slot-scope="scope">
            <!-- switch是根据布尔值来显示的 change当按钮发生改变触发-->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUser(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <!--  @size-change事件是每页多少行改变触发, @current-change当前页面的值发生改变触发 current-page当前展示的是第几页的数据 page-sizes配置每页多少行的选项 page-size当前情况下每页多少行数据 layout打开多少分页功能 total总数-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 3, 4]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <!-- visible.sync控制显示和隐藏绑定布尔值 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- close关闭时触发 -->
      <!-- 内容主体区域 -->
      <el-form label-width="70px" :model="addForm" :rules="addFormRules" ref="addFormRef" >
        <el-form-item label="用户名" prop="username">
          <el-input  v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input  v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input  v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input  v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 请求参数(获取用户的参数对象)
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 4
      },
      // 具体用户信息
      userList: [],
      // 用户总数
      total: 0,
      addDialogVisible: false,
      // 添加用户信息
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户信息
      editForm: {},
      // 对话框的显示与隐藏
      editDialogVisible: false,
      // 验证规则
      addFormRules: {
        username: [
          // triggler验证触发, required必须填写
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户内容信息校验
      editFormRules: {
        username: [
          // triggler验证触发, required必须填写
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('用户列表获取失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      // 修改数据并重新发送请求
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChanged (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 虽然发送请求时失败但是页面状态还是1改变了, 所以要变回去
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 添加用户对话框关闭时
    // resetField重置表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          // 可以发送请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('发送请求失败')
          this.$message.success('添加用户成功')
          // 关闭对话框
          this.addDialogVisible = false
          // 重新获取数据
          this.getUserList()
        }
      })
    },

    // 显示对话框,同时获取数据
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      // 通过绑定数据渲染用户数据
      this.editForm = res.data
      // 显示对话框
      this.editDialogVisible = true
    },
    // 重置表单
    // 监听关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
        if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        // 如果发送成功则数据库修改,只需重新获取用户列表即可
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示修改成功
        this.$message.success('更新用户信息成功！')
      })
    },

    // 删除用户
    async removeUser (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功！')
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
</style>
