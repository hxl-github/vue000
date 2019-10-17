import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式
import './assets/css/global.css'

//引入图标样式
import './assets/fonts/iconfont.css'

//全局注册
import TreeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本 编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 下面是解决点击同一路由报错
import Router from 'vue-router'
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

//引入axios
import axios from 'axios'
//根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //请求拦截器
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})



//全局注册 富文本编辑器
Vue.use(VueQuillEditor)


//定义一个时间的过滤器
Vue.filter("dateForm", function(time) {
    const dt = new Date(time)

    const y = dt.getFullYear()
        //转化为字符串然后若不足两位用字符串'0'来补
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    //return出去 完整的时间
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

//将其挂载到原型对象上
Vue.prototype.$http = axios

//全局注册
Vue.component('tree-table', TreeTable)


Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')