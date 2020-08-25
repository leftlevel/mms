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
                    placeholder="供应商名称"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item prop="linkman" v-if="!isDialog">
                <el-input
                    v-model="searchMap.linkman"
                    placeholder="联系人"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item prop="mobile" v-if="!isDialog">
                <el-input
                    v-model="searchMap.mobile"
                    placeholder="联系电话"
                    style="width: 200px"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="fetchData">查询</el-button>
                <!-- 重置需要绑定el-form-item 中的prop 否则无法生效 -->
                <el-button
                    type="primary"
                    @click="resetForm('searchForm')"
                    v-if="!isDialog"
                    >重置</el-button
                >
                <el-button type="primary" @click="handleAdd" v-if="!isDialog"
                    >新增</el-button
                >
            </el-form-item>
        </el-form>

        <!-- highlight-current-row 激活选中单选行
            @current-change 当点击某一行后，会触发这个事件从而调用对应的函数handleCurrentChange
            handleCurrentChange函数会接收两个参数：currentRow，oldCurrentRow
         -->
        <el-table
            :highlight-current-row="isDialog"
            @current-change="clickCurrentChange"
            :data="list"
            height="380"
            border
            style="width: 100%"
            stripe
        >
            <el-table-column
                type="index"
                label="序号"
                width="60px"
            ></el-table-column>
            <el-table-column prop="name" label="供应商名称"></el-table-column>
            <el-table-column
                prop="linkman"
                label="联系人"
                width="90px"
            ></el-table-column>
            <el-table-column
                v-if="!isDialog"
                prop="mobile"
                label="联系电话"
            ></el-table-column>
            <el-table-column
                v-if="!isDialog"
                prop="remark"
                label="备注"
            ></el-table-column>
            <el-table-column v-if="!isDialog" label="操作" width="150px">
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
        <!-- :layout进行条件判断 无弹框显示所有分页组件 弹框则显示部分分页组件  -->
        <el-pagination
            :layout="
                !isDialog
                    ? 'total, sizes, prev, pager, next, jumper'
                    : 'prev, pager, next'
            "
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50]"
            :page-size="pageSize"
            :total="total"
        >
        </el-pagination>
        <!-- 对话框 -->
        <el-dialog
            v-if="!isDialog"
            title="供应商编辑"
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
                <el-form-item label="供应商名称" prop="name">
                    <el-input v-model="pojo.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="联系人" prop="linkman">
                    <el-input
                        v-model="pojo.linkman"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="mobile">
                    <el-input
                        v-model="pojo.mobile"
                        autocomplete="off"
                    ></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input
                        v-model="pojo.remark"
                        autocomplete="off"
                        type="textarea"
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
            </div>
        </el-dialog>
    </div>
</template>

<script>
import SupplierApi from "@/api/supplier";

export default {
    props: {
        //接收父组件传递过来的数据，通过 isDialog 来判断是否为弹框
        //如果是true，则是弹框，false为列表
        isDialog: Boolean
    },

    data() {
        return {
            list: [],
            pageSize: 10, //每页显示条数
            currentPage: 1, //当前页码
            total: 0, //总记录数
            searchMap: {
                name: "",
                linkman: "",
                mobile: ""
            }, //条件查询的绑定字段值
            dialogFormVisible: false,
            pojo: {
                id: null,
                name: "",
                linkman: "",
                mobile: "",
                remark: ""
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: "供应商不能为空",
                        trigger: "blur"
                    }
                ],
                linkman: [
                    {
                        required: true,
                        message: "联系人不能为空",
                        trigger: "blur"
                    }
                ]
            }
        };
    },

    created() {
        this.fetchData();
    },

    methods: {
        // 当每页显示条数改变后，被触发，val是最新的每页显示条数
        handleSizeChange(val) {
            //console.log(val)
            this.pageSize = val;
            this.fetchData();
        },
        //当页码改变后，被触发，val是最新的页面
        handleCurrentChange(val) {
            //console.log(val)
            this.currentPage = val;
            this.fetchData();
        },

        fetchData() {
            SupplierApi.search(
                this.currentPage,
                this.pageSize,
                this.searchMap
            ).then(response => {
                const resp = response.data;
                this.list = resp.data.rows;
                this.total = resp.data.total;
                //console.log(this.list)
            });
        },
        //打开编辑窗口
        handleEdit(id) {
            this.handleAdd();
            SupplierApi.getById(id).then(response => {
                const resp = response.data;
                if (resp.flag) {
                    this.pojo = resp.data;
                } else {
                    //提示获取数据失败
                    this.$message({
                        message: resp.message,
                        type: "warning"
                    });
                }
            });
            //console.log("编辑", id);
        },

        updateData(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    SupplierApi.update(this.pojo).then(response => {
                        const resp = response.data;
                        console.log('更新')
                        if (resp.flag) {
                            this.fetchData();
                            this.pojo.id = null
                            this.dialogFormVisible = false;
                        } else {
                            this.$message({
                                message: resp.message,
                                type: "warning"
                            });
                        }
                    });
                } else {
                    return false;
                }
            });
        },

        handleDelete(id) {
            // console.log("删除", id);
            this.$confirm("确认删除这条记录吗", "提示", {
                confirmButtonText: "确认",
                cancelButtonText: "取消"
            })
                .then(() => {
                    SupplierApi.deleteById(id).then(response => {
                        const resp = response.data;
                        this.$message({
                            message: resp.message,
                            type: resp.flag ? "success" : "warning"
                        });
                        if (resp.flag) {
                            this.fetchData();
                        }
                    });
                })
                .catch(() => {
                    //取消
                });
        },

        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        //打开新增窗口
        handleAdd() {
            //this.pojo = {}
            this.dialogFormVisible = true;
            this.$nextTick(() => {
                // this.$nextTick()它是一个异步事件，当渲染结束后，它的回调函数才会被执行
                //弹出窗口打开之后，需要加载Dom，就需要花费一点时间，我们就应该在它加载完Dom后，再进行resetFields方法
                this.$refs["pojoForm"].resetFields();
            });
        },
        //提交新增表单
        addData(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    //提交表单
                    SupplierApi.add(this.pojo).then(response => {
                        const resp = response.data;
                        console.log('添加')
                        if (resp.flag) {
                            this.fetchData();
                            this.$message({
                                message: resp.message,
                                type:'success'
                            })
                            this.dialogFormVisible = false;
                        } else {
                            this.$message({
                                message: resp.flag,
                                type: "warning"
                            });
                        }
                    });
                } else {
                    return false;
                }
            });
        },

        //选择供应商 当点击某一行时，会调用这个函数进行处理
        clickCurrentChange(currentRow) {
            console.log('son',currentRow)
            //点击后，要将点击的数据传递到父组件（商品管理中）
            //则可以触发父组件中的option-supplier，触发之后
            //父组件可以在option-supplier 这个事件对应的处理函数中进行接收数据
            this.$emit('option-supplier', currentRow)
        }
    },
};
</script>