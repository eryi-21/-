<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="消息提示的文案" type="info" center show-icon clearable="false"></el-alert>
      <el-steps :space="200" :active="active - 0" finish-status="success" align-center>
        <!-- 这里的active应该是数字,所以要用active-0来得到
         -->
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form ref="goodsAddFormRef" :model="addForm" label-width="80px" :rules="addFormRules" label-position="top">
        <el-tabs v-model="active" :tab-position="tabPosition" :before-leave="beforeTabLeave" @tab-click="tabclick">
          <!-- 这里的active是字符串,因为代表name -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader :options="catelist" :props="cateProps" v-model="addForm.goods_cat" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 动态参数 -->
            <!-- 首先获取参数名称,通过循环获得动态参数,绑定其中的名称属性 -->
            <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
              <!-- 渲染器其中的可选项 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 添加图片 -->
            <!-- 因为虽然全局配置了请求头token，但这里上传图片不是用的axios，所以需要手动配置，利用组件自带属性 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data () {
    return {
      tabPosition: 'left',
      active: '0',
      // 添加表单
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 级联选择器被选中数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', triggle: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', triggle: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', triggle: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', triggle: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', type: 'array', triggle: 'blur' }
        ]
      },

      // 商品分类数据
      catelist: [],
      // 级联选择框的配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 动态参数
      manyData: [],
      onlyData: [],

      // 请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },

      // 预览图片路径
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    handleChange () {
      // 判断是否为三级分类
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('请选择三级分类')
      }
    },
    async getCateList () {
      const { data: res } = await this.$http.get('categories/')
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败!')
      this.catelist = res.data
    },

    // 阻止页签切换
    // 如果没有全部填完则不允许切换tab
    beforeTabLeave (aciveName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请完成未填选的选项!')
        return false
      }
    },

    async tabclick () {
      // 判断当active等于1时发送请求获取参数
      if (this.active === '1') {
        const { data: res } = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        // 如果动态参数中的可选项为空为了防止其渲染出空的选项让其赋值为[]
        // 首先遍历
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyData = res.data
      } else if (this.active === '2') {
        const { data: res } = await this.$http.get(`categories/${this.addForm.goods_cat[2]}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
        this.onlyData = res.data
        console.log(this.onlyData)
      }
    },

    // 预览图片
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
      // 获取图片的临时路径
      const filePath = file.response.data.tmp_path
      // 找到索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 根据索引值删除
      this.addForm.pics.splice(i, 1)
    },
    // 上传图片成功时触发
    handleSuccess (res) {
      // 为addForm添加一个pics属性(后面发送请求的参数)
      const picInfo = { pic: res.data.tmp_path }
      // 将其push到pics中
      this.addForm.pics.push(picInfo)
    },

    // 添加商品
    add () {
      // 表单预验证
      this.$refs.goodsAddFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入必填项')
        // 执行业务逻辑
        // 因为发送请求参数goodcats需要转换为字符串，而需要深拷贝，所以下载了依赖包lodash
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        // 编程式导航跳转
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-alert {
  margin: 0 10px;
}
.el-checkbox {
  margin: 0 0 5px 0;
}
img {
  width: 100%;
}
.btnAdd {
  margin-top: 20px;
}
</style>
