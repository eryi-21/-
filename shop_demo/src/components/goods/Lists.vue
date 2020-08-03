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
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索功能实现将输入值作为参数获取商品即可 -->
          <el-input clearable  v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" class="btn-col">
          <!-- 添加商品路由跳转到新的页面 -->
          <el-button class="btn-add" type="primary" @click="addPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 列表渲染 -->
      <el-table :data="goodList" border stripe>
        <!-- type="index"代表有序列号 prop绑定相应的值-->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="700px"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <!-- 时间这一栏需要使用过滤器来重置时间的格式 -->
        <el-table-column label="创建时间" prop="goods_time" width="150px">
          <template slot-scope="scope">{{ scope.row.add_time | dateFormat }}</template>
        </el-table-column>
        <!-- 操作按钮 -->
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button  type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除 -->
            <el-button  type="danger" icon="el-icon-delete" size="mini" @click="removeGoods(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodList: []
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    async getGoodList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败!')
      console.log(res.data)
      this.goodList = res.data.goods
      this.total = res.data.total
    },

    // 分页功能
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodList()
    },
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodList()
    },

    // 删除商品
    async removeGoods (row) {
      const confirmResult = await this.$confirm(
        '是否永久删除此商品!',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除"')
      } else {
        const { data: res } = await this.$http.delete('goods/' + row.goods_id)
        if (res.meta.status !== 200) return this.$message.error('删除商品失败!')
        this.$message.success('删除商品成功!')
        this.getGoodList()
      }
    },

    // 跳转到添加商品界面
    addPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>
.btn-col {
  // 调整一下布局位置
  margin-top: 4px;
}
</style>
