<template>
    <div>
        <!-- :inline="true" 表单一行显示
            input 框不绑定 v-model会导致无法输入
         -->
        <el-form
            ref="searchForm"
            :inline="true"
            :model="searchMap"
            style="margin-top: 20px"
        >
            <el-form-item prop="name">
                <el-input
                    v-model="searchMap.name"
                    placeholder="商品名称"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item prop="code">
                <el-input
                    v-model="searchMap.code"
                    placeholder="商品编号"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item prop="supplierName">
                <el-input
                    readonly
                    v-model="searchMap.supplierName"
                    placeholder="选择供应商"
                    style="width: 200px"
                    @click.native="dialogSupplierVisible = true"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="fetchData()">查询</el-button>
                <el-button type="primary" @click="handleAdd()">新增</el-button>
                <!-- 重置需要绑定el-form-item 中的prop 否则无法生效 -->
                <el-button
                    type="primary"
                    @click="$refs['searchForm'].resetFields()"
                    >重置</el-button
                >
            </el-form-item>
        </el-form>

        <!-- 表格组件 -->
        <el-table :data="list" height="380" border style="width: 100%" stripe>
            <el-table-column
                type="index"
                label="序号"
                width="60px"
            ></el-table-column>
            <el-table-column prop="name" label="商品名称"></el-table-column>
            <el-table-column
                prop="code"
                label="商品编码"
                width="90px"
            ></el-table-column>
            <el-table-column prop="spec" label="商品规格"></el-table-column>
            <el-table-column prop="retailPrice" label="零售价">
            </el-table-column>
            <el-table-column prop="purchasePrice" label="进货价">
            </el-table-column>
            <el-table-column prop="storageNum" label="库存数量">
            </el-table-column>
            <el-table-column prop="supplierName" label="供应商">
            </el-table-column>
            <el-table-column label="操作" width="150px">
                <template slot-scope="scope">
                    <el-button size="mini" @click="handleEdit(scope.row.id)"
                        >编辑</el-button
                    >
                    <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.row.id)"
                        >删除</el-button
                    >
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
        >
        </el-pagination>

        <!-- 选择供应商对话框 -->
        <el-dialog
            title="选择供应商"
            :visible.sync="dialogSupplierVisible"
            width="500px"
        >
            <supplier
                @option-supplier="optionSupplier"
                :isDialog="true"
            ></supplier>
        </el-dialog>

        <!-- 新增和更新对话框 -->
        <el-dialog
            title="编辑商品"
            :visible.sync="dialogFormVisible"
            width="500px"
        >
            <el-form
                :rules="rules"
                ref="pojoForm"
                :model="pojo"
                label-width="100px"
                label-position="right"
                style="width: 400px"
            >
                <el-form-item label="商品名称" prop="name">
                    <el-input v-model="pojo.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品编码" prop="code">
                    <el-input v-model="pojo.code" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品规格" prop="spec">
                    <el-input v-model="pojo.spec" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="零售价" prop="retailPrice">
                    <el-input
                        v-model="pojo.retailPrice"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="进货价" prop="purchasePrice">
                    <el-input
                        v-model="pojo.purchasePrice"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="供应商" prop="supplierName">
                    <el-input
                        readonly
                        @click.native="editOptionSupplier()"
                        v-model="pojo.supplierName"
                        autocomplete="off"
                        placeholder="选择供应商"
                    ></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <!-- <el-button type="primary" @click="addData('pojoForm')"
                    >确 定</el-button
                > -->
                <el-button
                    type="primary"
                    @click="
                        pojo.id === null
                            ? addData('pojoForm')
                            : updateData('pojoForm')
                    "
                    >确 定</el-button
                >
                <!-- <el-button type="primary" @click="addData('pojoForm')"
                    >确 定</el-button
                > -->
            </div>
        </el-dialog>
    </div>
</template>

<script>
import goodsApi from '@/api/goods'
import Supplier from '@/views/supplier'

export default {
    //注册 Supplier 作为子组件
    components: { Supplier },

    data() {
        return {
            list: [],
            pageSize: 10,
            currentPage: 1,
            total: 0,
            searchMap: {
                name: '',
                code: '',
                supplierName: '',
                supplierId: ''
            },
            dialogSupplierVisible: false, //弹出选择供应商弹出框
            dialogFormVisible: false, //编辑窗口
            isEdit: false, //是否为编辑窗口
            pojo: {
                id: null,
                name: '',
                code: '',
                spec: '',
                retailPrice: '',
                purchasePrice: '',
                supplierName: '',
                supplierId: null
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: '商品名称不能为空',
                        trigger: 'blur'
                    }
                ],
                code: [
                    {
                        required: true,
                        message: '商品编码不能为空',
                        trigger: 'blur'
                    }
                ],
                retailPrice: [
                    {
                        required: true,
                        message: '零售价不能为空',
                        trigger: 'blur'
                    }
                ]
            }
        }
    },

    created() {
        this.fetchData()
    },

    methods: {
        fetchData() {
            goodsApi
                .search(this.currentPage, this.pageSize, this.searchMap)
                .then(response => {
                    const data = response.data.data
                    this.list = data.rows
                    this.total = data.total
                    //console.log(this.list);
                })
        },

        handleSizeChange(val) {
            this.pageSize = val
            this.fetchData()
        },

        handleCurrentChange(val) {
            this.currentPage = val
            this.fetchData()
        },

        optionSupplier(currentRow) {
            console.log('parent', currentRow)
            if (this.isEdit) {
                //是编辑窗口打开的选择供应商
                this.pojo.supplierName = currentRow.name
                this.pojo.supplierId = currentRow.id
            } else {
                //就是搜索区域选择的供应商
                this.searchMap.supplierName = currentRow.name //供应商名称
                this.searchMap.supplierId = currentRow.id //供应商id
            }
            this.isEdit = false //重置 isEdit为false
            this.dialogSupplierVisible = false
        },

        handleAdd() {
            //this.pojo = {}
            this.dialogFormVisible = true
            this.$nextTick(() => {
                // this.$nextTick()它是一个异步事件，当渲染结束后，它的回调函数才会被执行
                //弹出窗口打开之后，需要加载Dom，就需要花费一点时间，我们就应该在它加载完Dom后，再进行resetFields方法
                this.$refs['pojoForm'].resetFields()
            })
        },

        addData(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    // 提交表单
                    goodsApi.add(this.pojo).then(response => {
                        const resp = response.data
                        console.log('添加')
                        if (resp.flag) {
                            this.fetchData()
                            this.$message({
                                message: resp.message,
                                type: 'success'
                            })
                            this.dialogFormVisible = false
                        } else {
                            this.$message({
                                message: resp.message,
                                type: 'warning'
                            })
                        }
                    })
                } else {
                    return false
                }
            })
        },

        editOptionSupplier() {
            this.isEdit = true //当前是通过编辑窗口中的选择供应商打开的窗口
            this.dialogSupplierVisible = true
        },

        handleEdit(id) {
            this.handleAdd()
            goodsApi.getById(id).then(response => {
                const resp = response.data
                if (resp.flag) {
                    this.pojo = resp.data
                    console.log(this.pojo)
                }
            })
        },

        //提交更新数据
        updateData(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    //校验通过
                    goodsApi.update(this.pojo).then(response => {
                        const resp = response.data
                        console.log('更新')
                        if (resp.flag) {
                            this.fetchData()
                            this.pojo.id = null
                            this.dialogFormVisible = false
                        } else {
                            this.$message({
                                message: resp.message,
                                type: 'warning'
                            })
                        }
                    })
                } else {
                    return false
                }
            })
        },

        handleDelete(id) {
            this.$confirm('确认删除这条记录吗', '提示', {
                confirmButtonText: '确认',
                cancelButtonText: '取消'
            })
                .then(() => {
                    //确认
                    goodsApi.deleteById(id).then(response => {
                        const resp = response.data
                        this.$message({
                            message: resp.message,
                            type: resp.flag ? 'success' : 'error'
                        })
                        if (resp.flag) {
                            this.fetchData()
                        }
                    })
                })
                .catch(() => {
                    //取消
                })
        }
    },
}
</script>