<template>
  <el-container class="layout-wrapper">
    <el-aside width="220px" class="aside-container">
      <div class="logo-box">
        <img
          src="https://element-plus.org/images/element-plus-logo.svg"
          alt="logo"
          class="logo-img"
        />
        <span class="logo-text">Smart Exam</span>
      </div>

      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        router
        :collapse-transition="false"
        text-color="#4E5969"
        active-text-color="#165DFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <div class="menu-group">内容管理</div>
        <el-menu-item index="/admin/question/list">
          <el-icon><Document /></el-icon>
          <span>题目题库</span>
        </el-menu-item>
        <el-menu-item index="/admin/category/list">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>

        <div class="menu-group">考务中心</div>
        <el-menu-item index="/admin/paper/list">
          <el-icon><Files /></el-icon>
          <span>试卷管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/score/list">
          <el-icon><Trophy /></el-icon>
          <span>成绩分析</span>
        </el-menu-item>

        <div class="menu-group">多媒体管理</div>
        <el-menu-item index="/admin/video/list">
          <el-icon><VideoPlay /></el-icon>
          <span>视频管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/video/category">
          <el-icon><Collection /></el-icon>
          <span>视频分类</span>
        </el-menu-item>

        <div class="menu-group">系统设置</div>
        <el-menu-item index="/admin/banner/list">
          <el-icon><Picture /></el-icon>
          <span>轮播配置</span>
        </el-menu-item>
        <el-menu-item index="/admin/notice/list">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header-container">
        <div class="header-left">
          <el-icon class="collapse-btn" :size="20"><Fold /></el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{
              $route.meta.title || "工作台"
            }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="前往学生端首页" placement="bottom">
            <div class="icon-item" @click="$router.push('/student/home')">
              <el-icon :size="20"><HomeFilled /></el-icon>
            </div>
          </el-tooltip>

          <div class="icon-item">
            <el-badge is-dot class="item"
              ><el-icon :size="18"><Bell /></el-icon
            ></el-badge>
          </div>
        </div>
      </el-header>

      <el-main class="main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-wrapper {
  height: 100vh;
  display: flex;
}
.aside-container {
  background: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
  z-index: 10;
}
.logo-box {
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  border-bottom: 1px solid #f2f3f5;
}
.logo-img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.el-menu-vertical {
  border-right: none;
  padding-top: 10px;
}
.el-menu-item {
  margin: 4px 10px;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
}
.el-menu-item.is-active {
  background-color: #e8f3ff;
  color: #165dff;
  font-weight: 500;
}
.el-menu-item:hover {
  background-color: #f2f3f5;
}
.menu-group {
  padding: 12px 20px 8px;
  font-size: 12px;
  color: #86909c;
}

.header-container {
  background: #fff;
  height: 60px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.header-left {
  display: flex;
  align-items: center;
}
.collapse-btn {
  cursor: pointer;
  color: #4e5969;
  margin-right: 16px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.icon-item {
  cursor: pointer;
  color: #4e5969;
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.username {
  margin-left: 8px;
  font-size: 14px;
  color: #1d2129;
}

.main-container {
  background: #f2f3f5;
  padding: 20px;
}
</style>
