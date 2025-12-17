import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import VirtualTableDemo from '@/views/VirtualTableDemo.vue'
import LoginView from '@/views/auth/LoginView.vue'
import ForbiddenView from '@/views/auth/ForbiddenView.vue'
import PermissionShell from '@/views/permission/PermissionShell.vue'
import PermissionHome from '@/views/permission/PermissionHome.vue'
import { installAuthGuards } from '@/permission-demo/guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/table',
    name: 'table',
    component: VirtualTableDemo,
    meta: { public: true, title: '虚拟表格' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true, title: '登录' }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { public: true, title: '无权限' }
  },
  {
    path: '/',
    name: 'permission-root',
    component: PermissionShell,
    meta: { public: false, title: '权限演示' },
    children: [
      {
        path: '',
        name: 'permission-home',
        component: PermissionHome,
        meta: { public: false, title: '首页' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

installAuthGuards(router)

