import Vue from "vue";
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import App from "./App.vue";
import router from "./router/index";
import store from "./store";
//引入全局权限拦截
import './permission'

//引入使用组件库
Vue.use(ElementUI);

Vue.config.productionTip = process.env.NODE_ENV;
console.log(process.env.NODE_ENV) ////开发环境 development,生产 production
console.log(process.env.VUE_APP_SERVICE_URL) //在.env.development 文件中

new Vue({
    router,
    store, //注册
    render: h => h(App)
}).$mount("#app");
