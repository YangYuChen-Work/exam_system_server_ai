<template>
    <el-dialog v-model="visible" title="欢迎登录 Smart Exam" width="400px" center :close-on-click-modal="false"
        :append-to-body="true" class="login-dialog">
        <div class="login-body">
            <div class="logo-area">
                <div class="logo-icon">🚀</div>
                <p class="sub-text">开发调试模式 (任意输入进入)</p>
            </div>

            <el-form :model="form" size="large" class="login-form">
                <el-form-item>
                    <el-input v-model="form.username" placeholder="账号 (任意)" prefix-icon="User"
                        @keyup.enter="handleLogin" />
                </el-form-item>
                <el-form-item>
                    <el-input v-model="form.password" type="password" placeholder="密码 (任意)" prefix-icon="Lock"
                        show-password @keyup.enter="handleLogin" />
                </el-form-item>

                <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
                    立即进入后台
                </el-button>
            </el-form>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'login-success'])

const visible = ref(false)
const loading = ref(false)
const userStore = useUserStore()
const router = useRouter()

watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

const form = reactive({ username: 'admin', password: '' })

const handleLogin = async () => {
    loading.value = true
    try {
        // 调用刚才写的“伪造登录”
        await userStore.loginAction(form)

        ElMessage.success('登录成功 (Dev Mode)')
        visible.value = false
        emit('login-success')

        // ⚡️ 强制跳转逻辑：
        // 如果输入的是 admin (或空)，去后台；否则去前台
        if (!form.username || form.username === 'admin') {
            console.log('跳转至管理后台...')
            router.push('/admin/dashboard')
        } else {
            console.log('跳转至学生端...')
            router.push('/student/home')
        }

    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-body {
    padding: 0 20px;
    text-align: center;
}

.logo-area {
    margin-bottom: 30px;
}

.logo-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.sub-text {
    color: #f56c6c;
    font-weight: bold;
    font-size: 14px;
}

.submit-btn {
    width: 100%;
    border-radius: 20px;
    font-weight: bold;
    letter-spacing: 1px;
    height: 40px;
}
</style>