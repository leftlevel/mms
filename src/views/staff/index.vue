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
            <el-form-item prop="username">
                <el-input
                    v-model="searchMap.username"
                    placeholder="账号"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item prop="name">
                <el-input
                    v-model="searchMap.name"
                    placeholder="姓名"
                    style="width: 200px"
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
            <el-table-column prop="username" label="账号"></el-table-column>
            <el-table-column prop="name" label="姓名"></el-table-column>
            <el-table-column prop="age" label="年龄"> </el-table-column>
            <el-table-column prop="mobile" label="电话"> </el-table-column>
            <el-table-column prop="salary" label="薪酬"> </el-table-column>
            <el-table-column prop="entryDate" label="入职时间">
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

        <!-- 新增和更新对话框 -->
        <el-dialog
            title="编辑员工"
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
                <el-form-item label="账号" prop="username">
                    <el-input
                        v-model="pojo.username"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="pojo.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="年龄" prop="age">
                    <el-input v-model="pojo.age" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input
                        v-model="pojo.mobile"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="薪酬" prop="salary">
                    <el-input
                        v-model="pojo.salary"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <!-- 日期选择器 -->
                <el-form-item label="入职日期" prop="entryDate">
                    <div class="block">
                        <!-- value-format 指定绑定值的格式 -->
                        <el-date-picker
                            value-format="yyyy-MM-dd"
                            v-model="pojo.entryDate"
                            type="date"
                            placeholder="请点击选择"
                        >
                        </el-date-picker>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
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
import staffApi from '@/api/staff'

export default {
    data() {
        return {
            list: [],
            pageSize: 10,
            currentPage: 1,
            total: 0,
            searchMap: {
                username: '',
                name: ''
            },
            dialogFormVisible: false,
            pojo: {
                id: null,
                username: '',
                name: '',
                age: '',
                mobile: '',
                salary: '',
                entryDate: ''
            },
            rules: {
                username: [
                    {
                        required: true,
                        message: '账号不能为空',
                        trigger: 'blur'
                    }
                ],
                name: [
                    {
                        required: true,
                        message: '姓名不能为空',
                        trigger: 'blur'
                    }
                ],
                username: [
                    {
                        required: true,
                        message: '账号不能为空',
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
            staffApi
                .search(this.currentPage, this.pageSize, this.searchMap)
                .then(response => {
                    const data = response.data.data
                    this.list = data.rows
                    this.total = data.total
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

        handleAdd() {
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
                    staffApi.add(this.pojo).then(response => {
                        const resp = response.data
                        console.log('添加', resp)
                        if (resp.flag) {
                            this.fetchData()
                            this.$message({
                                message: resp.message,
                                type: 'success'
                            })
                        }
                        this.dialogFormVisible = false
                    })
                } else {
                    return false
                }
            })
        },

        handleEdit(id) {
            this.handleAdd()
            staffApi.getById(id).then(response => {
                const resp = response.data
                if (resp.flag) {
                    this.pojo = resp.data
                    console.log(this.pojo)
                }
            })
        },

        updateData(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    staffApi.update(this.pojo).then(response => {
                        const resp = response.data
                        console.log('员工更新')
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
                    staffApi.deleteById(id).then(response => {
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
    }
}
</script>