import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'       // 管理端布局
import StudentLayout from '../layout/student.vue' // 学生端布局

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 1. 登录页

    // 2. 根路径：默认跳转到学生端首页
    { path: '/', redirect: '/student/home' },

    // 3. 学生端路由 (前台)
    {
      path: '/student',
      component: StudentLayout,
      redirect: '/student/home',
      children: [
        {
          path: 'home',
          component: () => import('../views/student/home/index.vue'),
          meta: { title: '在线考试中心' }
        },
        {
          path: 'exam',
          component: { template: '<div>考试列表开发中...</div>' },
          meta: { title: '在线考试' }
        },
        {
          path: 'video',
          component: { template: '<div>视频课程开发中...</div>' },
          meta: { title: '视频课程' }
        },
        {
          path: 'record',
          component: { template: '<div>考试记录开发中...</div>' },
          meta: { title: '考试记录' }
        }
      ]
    },

    {
    path: '/exam',
    // 这里复用学生端的布局容器，保证头部导航栏还在
    component: () => import('../layout/student.vue'), 
    children: [
      {
        path: 'list',  // 浏览器访问地址： /exam/list
        name: 'StudentExamList',
        component: () => import('../views/exam/ExamList.vue'),
        meta: { title: '在线考试' }
      }
    ]
  },

  // ... 其他路由 ...
    // 4. 管理端路由 (后台) - 给所有路径加上 /admin 前缀
    {
      path: '/admin',
      component: Layout,
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () => import('../views/dashboard/index.vue'),
          meta: { title: '工作台' }
        },
        // --- 系统设置 ---
        {
          path: 'banner/list',
          component: () => import('../views/system/banner/index.vue'),
          meta: { title: '轮播图管理' }
        },
        {
          path: 'notice/list',
          component: () => import('../views/system/notice/index.vue'),
          meta: { title: '公告管理' }
        },
        // --- 内容管理 ---
        {
          path: 'category/list',
          component: () => import('../views/content/category/index.vue'),
          meta: { title: '分类管理' }
        },
        {
          path: 'question/list',
          component: () => import('../views/content/question/index.vue'),
          meta: { title: '题目题库' }
        },
        // --- 考务中心 ---
        {
          path: 'paper/list',
          component: () => import('../views/exam/paper/index.vue'),
          meta: { title: '试卷管理' }
        },
        {
          path: 'score/list',
          component: () => import('../views/exam/score/index.vue'),
          meta: { title: '成绩分析' }
        },
        // --- 多媒体管理 ---
        {
          path: 'video/list',
          component: () => import('../views/video/list/index.vue'),
          meta: { title: '视频管理' }
        },
        {
          path: 'video/category',
          component: () => import('../views/video/category/index.vue'),
          meta: { title: '视频分类' }
        }
      ]
    }
  ]
})

export default router