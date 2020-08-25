import Vue from "vue";
import VueRouter from "vue-router";
//import Login from '../views/login/index.vue'
import Login from '../views/login' //取名为index.vue 或者index.js 可以不写路径
import Layout from '@/components/Layout.vue'
//以下是导航栏组件
import Home from '@/views/home'
import Member from '@/views/member'
import Supplier from '@/views/supplier'
import Goods from '@/views/goods'
import Staff from '@/views/staff'

Vue.use(VueRouter);

const routes = [
    {
        path: "/login",
        name: "login",
        component: Login
    },
    {
        path: "/",
        name: "layout",
        component: Layout,
        redirect: '/home', //重定向到根目录下的/home
        children: [
            {
                path: '/home',
                component: Home,
                meta: { title: '首页' }
            },
            // {
            //     path: '/member',
            //     component: Member
            // }
        ]
    },
    {
        path: '/member',
        component: Layout,
        children: [
            {
                path: '/',
                component: Member,
                meta: {title: '会员管理'}
            }
        ]
    },
    {
        path: '/supplier',
        component: Layout,
        children: [
            {
                path: '/',
                component: Supplier,
                meta: {title: '供应商管理'}
            }
        ]
    },
    {
        path: '/goods',
        component: Layout,
        children: [
            {
                path: '/',
                component: Goods,
                meta: {title: '商品管理'}
            }
        ]
    },
    {
        path: '/staff',
        component: Layout,
        children: [
            {
                path: '/',
                component: Staff,
                meta: {title: '员工管理'}
            }
        ]
    },
];

const router = new VueRouter({
    //mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;
