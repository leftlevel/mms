import { getToken, setToken, setUser, getUser, removeToken } from '@/utils/auth'
import { login, getUserInfo, logout } from '@/api/login'


const user = {
    state: {
        token: getToken(), //getToken 作为token初始值，解决刷新页面之后token为null
        user: getUser()
    },

    mutations: {
        SET_TOKEN(state, token) {
            state.token = token
            setToken(token)
        },

        SET_USER(state, user) {
            state.user = user
            setUser(user)
        },
    },

    actions: {
        //方法开头大写
        //登录获取token
        Login({ commit }, form) {
            //resolve 触发成功处理，reject 触发异常处理
            return new Promise((resolve, reject) => {
                login(form.username.trim(), form.password).then(response => {
                    const resp = response.data //获取响应的data 数据
                    commit('SET_TOKEN', resp.data.token)  //用commit调用SET_TOKEN，载荷为resp.data.token
                    //通知组件已经将token更新成功
                    resolve(resp)
                }).catch(error => {
                    reject(error)
                })
            })
        },

        //通过token获取用户信息
        GetUserInfo({ commit, state }) {
            //console.log('GetUserInfo', state.token)
            return new Promise((resolve, reject) => {
                getUserInfo(state.token).then(response => {
                    const respUser = response.data
                    //console.log('respUser',respUser)
                    commit('SET_USER', respUser.data)
                    resolve(respUser)
                }).catch(error => {
                    reject(error) //通知异常
                })
            })
        },

        //退出
        Logout({commit, state}) {
            return new Promise((resolve, reject) => {
                logout(state.token).then(response => {
                    const resp = response.data
                    commit('SET_TOKEN', '')
                    commit('SET_USER', null) //传入参数不能为{}，否则对象为一个空对象，权限校验拦截器不会获取userInfo
                    removeToken()
                    resolve(resp)
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
}

export default user