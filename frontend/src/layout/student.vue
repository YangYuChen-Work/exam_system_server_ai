<template>
  <div class="student-layout">
    <div class="nav-header">
      <div class="nav-content">
        <div class="logo" @click="$router.push('/')">
          <span class="icon">🎓</span>
          <span class="text">Smart Exam</span>
        </div>

        <el-menu :default-active="$route.path" mode="horizontal" router class="nav-menu" :ellipsis="false">
          <el-menu-item index="/student/home">首页</el-menu-item>
          <el-menu-item index="/exam/list">在线考试</el-menu-item>
          <el-menu-item index="/video/list">视频课堂</el-menu-item>
          <el-menu-item index="/record/list">考试记录</el-menu-item>
        </el-menu>

        <div class="user-actions">
          <el-dropdown v-if="userStore.token">
            <span class="el-dropdown-link">
              <el-avatar :size="32" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="username">{{
                userStore.userInfo?.realName ||
                userStore.userInfo?.username ||
                "同学"
              }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/admin/dashboard')">进入管理后台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button v-else type="primary" round @click="showLogin = true">登录 / 注册</el-button>
        </div>
      </div>
    </div>

    <div class="main-content">
      <router-view />
    </div>

    <div class="footer">
      <p>© 2026 Smart Exam System. All Rights Reserved.</p>
    </div>

    <LoginDialog v-model="showLogin" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../store/user";
import { useRouter } from "vue-router";
import LoginDialog from "../components/LoginDialog.vue"; // 引入组件

const userStore = useUserStore();
const router = useRouter();
const showLogin = ref(false); // 控制弹窗显示

const handleLogout = () => {
  localStorage.removeItem("exam_token");
  userStore.token = "";
  userStore.userInfo = null;
  router.push("/student/home"); // 退出后留着首页
  location.reload(); // 刷新一下清空状态
};
</script>

<style scoped>
/* 保持之前的样式不变，只需确保 el-menu-item 样式正确 */
.student-layout {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.nav-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
  cursor: pointer;
}

.logo .icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo .text {
  font-size: 20px;
  font-weight: bold;
  color: #165dff;
}

.nav-menu {
  border-bottom: none !important;
  flex: 1;
  background: transparent;
}

.user-actions {
  margin-left: 20px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #1d2129;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.footer {
  text-align: center;
  padding: 20px;
  color: #86909c;
  font-size: 12px;
  background: #fff;
  margin-top: auto;
}
</style>
