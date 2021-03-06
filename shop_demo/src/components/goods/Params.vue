<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader :options="catelist" :props="cateProps" v-model="selectedCateKeys" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane label="动态属性" name="many">
            <!-- 添加参数的按钮 -->
            <!-- 功能: 1.在未选择商品和没有选择第三级商品时禁用, 即判断商品分类选中的id数组长度是否为3 -->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开行，包含参数具体属性 -->
              <el-table-column type="expand">
                <!-- tag放置具体属性的tag -->
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签, 因为此时的获取的数据是字符串，所以要在获取数据时将此数据转化为数组 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" class="tag" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 输入的文本框，为 -->
                  <el-input v-if="scope.row.inputVisible" class="input-new-tag" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
            <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
            <!-- 静态参数表格 -->
            <el-table :data="onlyTableData" border stripe>
            <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <!-- 首先在页面渲染中会根据不同的tab选项出现不同的对话框名,通过判断和计算属性来实现 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类数据
      catelist: [],
      // 级联选择框的配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选择商品分类的id数组
      selectedCateKeys: [],

      // tab选中项(被激活的tab项)
      activeName: 'many',
      // 静态参数数据
      onlyTableData: [],
      // 动态参数数据
      manyTableData: [],

      // 添加属性对话框开关
      addDialogVisible: false,
      // 添加属性信息
      addForm: {
        attr_name: ''
      },
      // 校验添加的属性
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },

      // 编辑属性对话框开关
      editDialogVisible: false,
      // 编辑属性信息
      editForm: {},
      // 编辑属性校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 添加参数按钮禁用
    isBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    titleText () {
      if (this.activeName === 'only') {
        return '静态属性'
      } else {
        return '动态属性'
      }
    }
  },
  methods: {
    handleChange () {
      this.getParamsData()
    },
    handleTabClick () {
      this.getParamsData()
    },
    // 获取数据函数逻辑
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败!')
      this.catelist = res.data
    },
    // 获取参数数据处理逻辑, 因为在级联选择器change事件和tabclick事件都触发此逻辑,所以独立写一个函数
    async getParamsData () {
      // 发送获取参数请求中有一个是3级商品id,所以需要对id进行判断是否为三级
      if (this.selectedCateKeys.length !== 3) {
        // 如果不是3级
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get('categories/' + this.selectedCateKeys[2] + '/attributes', { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败!')

      // 判断赋值
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }

      // 把参数分类可选项转化为数组，使用split方法
      // 首先便利所有分类，然后判断每个分类中的可选项数组是否为空，如果不为空则直接分割转化即可，为空则让其为一个空数组，否则未出现一个为空的可选项
      res.data.forEach(item => {
        // input输入框显示开关
        item.inputVisible = false
        // 输入框的值
        item.inputValue = ''
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      })
    },

    // 添加参数
    // 打开对话框
    showAddParamsDialog () {
      this.addDialogVisible = true
    },
    // 关闭对话框触发
    addDialogClosed () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 添加属性事件处理逻辑
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories/' + this.selectedCateKeys[2] + '/attributes', { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加属性失败!')
        this.$message.success('属性已添加!')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },

    // 编辑参数
    async showEditParamsDialog (id) {
      // editForm中的attr_name等于当前点击属性
      const { data: res } = await this.$http.get(`categories/${this.selectedCateKeys[2]}/attributes/${id}`, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取属性失败!')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        const { data: res } = await this.$http.put(`categories/${this.selectedCateKeys[2]}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name, attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改属性失败!')
        this.$message.success('修改属性成功!')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 删除参数
    async removeParams (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除此属性, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('操作已取消!')
      }
      const { data: res } = await this.$http.delete(`categories/${this.selectedCateKeys[2]}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败!')
      this.$message.success('删除成功!')
      this.getParamsData()
    },

    // 参数下的可选项
    // 点击添加按钮显示为输入框
    showInput (row) {
      // 在显示以及赋值时会出现参数同步改变,所以需要为各个参数分别创建一个相应的值,在为可选项循环赋值时添加两个属性即可
      // 这里也需要通过形参传递来获得值
      row.inputVisible = true
      // 这个地方的值确实已经改变,但是要重新打开展开栏才能切换, 暂时没有找到原因
    },
    handleInputConfirm (row) {
      // 首先需要获得发送请求的数据,而其中首先要判断是否能发送请求,即输入框中是否写了新的可选项
      if (row.inputValue.trim().length === 0) {
        // 重置输入框
        row.inputValue = ''
        row.inputVisible = false
      } else {
        // 将输入的加入attr_vals当中
        // 如果没有return，则证明输入的内容，需要做后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    // 删除可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    async saveAttrVals (row) {
      // 发送请求
      const { data: res } = await this.$http.put(`categories/${this.selectedCateKeys[2]}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) return this.$message.error('添加失败!')
      this.$message.success('修改成功!')
      // 这里不需要重新刷新是因为上面已经将其添加到了数据中
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin-top: 10px;
}
.tag {
  margin: 0 5px;
}
.input-new-tag {
  width: 120px;
  margin: 0 5px;
}
.button-new-tag {
  margin: 0 5px;
}
</style>
