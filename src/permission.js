/**
 * 权限校验
 * Vue Router中 的前置钩子函数 beforEach(to, from,next)
 * 当进行路由跳转之前，进行判断 是否已经登录过，登录过则允许访问非登录页面，否则返回登录页面
 * 
 * to: 即将要进入的目标路由对象
 * from: 即将要离开的路由对象
 * next: 是一个方法，可以指定路由地址，进行路由跳转
 */

import router from './router'
import { getUserInfo } from './api/login'
import store from './store' // js模块使用Vuex要进行导入 不能直接使用this.$store.state.user

router.beforeEach((to, from, next) => {
    //1. 获取token
    //const token = localStorage.getItem('mxg-msm-token')
    const token = store.state.user.token
    //console.log('token',token)

    if (!token) {
        //1.1 如果没有获取到
        //要访问非登录页面，则不让访问，回到登录页面 /login
        if (to.path !== '/login') {
            next({ path: '/login' })
        } else {
            //请求登录页 /login
            next()
        }
    } else {
        //1.2 获取到token ,
        //1.2.1 请求的路由 /login， 那就去目标路由
        if (to.path === '/login') {
            next()
        } else {
            //1.2.2 请求路由非登录页面，先在本地查看是否有用户信息
            //const userInfo = localStorage.getItem('mxg-msm-user')
            const userInfo = store.state.user.user
            //console.log('userInfo', userInfo)
            if (userInfo) {
                next()
            } else {
                // 如果本地没有用户信息，就通过token去获取用户信息
                store.dispatch('GetUserInfo').then(response => {
                    if (response.flag) {
                        next()
                    } else {
                        next({path: '/login'})
                    }
                }).catch(error => {
                })
            }
            //那就通过token去获取用户信息，如果获取到用户信息，则进入非登录页面，否则回到登录页
        }

    }

})