import axios from 'axios';
import { Loading, Message } from 'element-ui'; //引入加载窗口 和 单独引用消息提示


const loading = {
    loadingInstance: null,
    //打开加载
    open() {
        //创建实例，而且会打开加载窗口
        if (this.loadingInstance === null) {
            this.loadingInstance = Loading.service({
                target: '.main',
                text: '拼命加载中',
                background: 'rgba(0, 0, 0, 0.5)',
                spinner: 'el-icon-loading'
            });
        }
    },
    // 关闭加载
    close() {
        // 不为空时，则关闭加载窗口
        if (this.loadingInstance !== null) {
            this.loadingInstance.close()
        }
        this.loadingInstance = null
    }
}

//在public下自动找db.json
// axios.get('/db.json').then(response => {
//     console.log(response.data)
// })

//自己配置axios 请求
const request = axios.create({
    // /db.json > 通过 axios > /dev-api/db.json >通过vue.config.js 代理 VUE_APP_BASE_API = http://localhost:8001/db.json
    baseURL: process.env.VUE_APP_BASE_API,
    // baseURL: '/',
    timeout: 5000 //请求超时，5000毫秒，请求超过5000毫秒报超时警告
})

//请求拦截器
request.interceptors.request.use(config => {
    //请求拦截
    loading.open() //打开加载窗口
    return config
}, error => {
    //出现异常
    loading.close() //关闭加载窗口
    return Promise.reject(error);
})

//响应拦截器
request.interceptors.response.use(response => {
    //response.data
    const resp = response.data
    loading.close() //关闭加载窗口
    //console.log('响应状态码',resp.code)
    //后台正常响应的状态，如果不是2000，说明后台处理有问题
    if (resp.code !== 2000) {
        Message({
            message: resp.message || '系统异常',
            type: 'warning',
            duration: 5 * 1000
        })
    }

    return response
}, error => {
    loading.close() //关闭加载窗口
    //console.log('response.error',error.response)
    Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
    })
    return Promise.reject(error);
})

// request.get('/db.json').then(response => {
//     console.log(response.data)
// })

export default request //导出自定义创建的 axios 对象