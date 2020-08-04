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
        <el-tabs v-model="active" :tab-position="tabPosition" :before-leave="beforeTabLeave">
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
          <el-tab-pane label="商品参数" name="1">商品参数</el-tab-pane>
          <el-tab-pane label="商品属性" name="2">商品属性</el-tab-pane>
          <el-tab-pane label="商品图片" name="3">商品图片</el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>
<script>
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
        goods_cat: []
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
      }
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
    }
  }
}
</script>
<style lang="less" scoped>
.el-alert {
  margin: 0 10px;
}
</style>
