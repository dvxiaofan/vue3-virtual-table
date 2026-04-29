import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import VirtualTableDemo from '@/views/VirtualTableDemo.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'table',
    component: VirtualTableDemo,
    meta: { title: '虚拟表格' }
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

