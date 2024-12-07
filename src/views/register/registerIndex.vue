<template>
  <div class="login-page">
    <div class="login-card flex lg:flex-row flex-col">
      <!-- Left side image -->
      <div class="lg:w-1/2 w-full flex flex-col items-center justify-center p-8">
        <!-- 图标和标题 -->
        <div class="flex flex-col items-center mb-4">
          <!-- Alpha 符号 -->
          <span class="alpha-icon text-blue-500 text-6xl font-bold">α</span>
          <!-- 标题文字 -->
          <p class="crypto-title text-3xl font-extrabold mt-2">{{ $t('registerindex.crypt_o_alpha') }}</p>
        </div>
        <!-- 描述文字 -->
        <div class="text-center text-gray-600 text-lg font-semibold">{{ $t('registerindex.join_us_and_master_every_opportunity_to_transaction') }}</div>
      </div>

      <!-- Right side registration form -->
      <div class="lg:w-1/2 w-full p-8">
        <h1>{{ $t('registerindex.register') }}</h1>
        <el-form
          ref="ruleFormRef"
          :rules="locale === 'zh-cn' ? zhRules : rules"
          :model="formData"
          class="register-form"
        >
          <el-form-item prop="userName">
            <input type="text" v-model="formData.userName" placeholder="邮箱" class="form-input">
          </el-form-item>
          <el-form-item prop="password">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              placeholder="密码"
              class="form-input"
            >
          </el-form-item>
          <el-form-item prop="repeatPassword">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.repeatPassword"
              placeholder="确认密码"
              class="form-input"
            >
          </el-form-item>
          <el-form-item prop="identity_code">
            <div class="flex-container">
              <input type="text" v-model="formData.identity_code" placeholder="验证码" class="form-input verification-input">
              <button
                class="verification-btn"
                :disabled="loading"
                @click="getCode"
              >
                {{ getCodeBtn }}
              </button>
            </div>
          </el-form-item>
          <el-form-item prop="shareCode">
            <input
              type="text"
              v-model="formData.shareCode"
              placeholder="邀请码"
              class="form-input"
            >
          </el-form-item>
          <el-form-item>
            <button
              class="submit-btn"
              @click="toRegister"
            >{{ $t('registerindex.register') }}</button>
            <div class="login-link" @click="toLogin">{{ $t('registerindex.existing_account_') }}</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs, ref, onMounted, watch } from 'vue'
import { sendEmailCode, registerEmail } from "@/http/api/user";
import { ElMessage } from 'element-plus'
import { setSession } from "@/utils/tools";
import { useUserStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { trackEvent } from '@/utils/UmUtils'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const ruleFormRef = ref(null)
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  data.formData.shareCode = route.query.code || ''
  if (locale.value === 'zh-cn') {
    data.getCodeBtn = '获取验证码'
  } else {
    data.getCodeBtn = 'Get Code'
  }
})

const data = reactive({
  formData: {},
  loading: false,
  signLoading: false,
  getCodeBtn: '获取验证码',
  codeSecond: 60,
  timer: null,
  showPassword: false
})

watch(() => locale.value, (newVal) => {
  if (data.getCodeBtn === '获取验证码' && newVal === 'zh-cn') {
    data.getCodeBtn = '获取验证码'
  } else if (data.getCodeBtn === '获取验证码' && newVal === 'en-us') {
    data.getCodeBtn = 'Get Code'
  }
})

const checkPassword = (rule, value, callback) => {
  if (!value) {
    return callback();
  } else {
    if (value.length >= 6) {
      callback();
    } else {
      if (locale.value === 'zh-cn') {
        return callback(new Error('密码长度不能少于6位数'));
      } else {
        return callback(new Error('Password length must not be less than 6'));
      }
    }
  }
}

const checkRepeat = (rule, value, callback) => {
  if (!value) {
    return callback();
  } else {
    if (value === data.formData.password) {
      callback();
    } else {
      if (locale.value === 'zh-cn') {
        return callback(new Error('两次输入的密码不一致'));
      } else {
        return callback(new Error('Incorrect password'));
      }
    }
  }
}

const rules = reactive({
  userName: [
    { required: true, message: 'Empty email', trigger: 'blur' }
  ],
  identity_code: [
    { required: true, message: 'Empty code', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Empty password', trigger: 'blur' },
    { validator: checkPassword, trigger: 'blur' }
  ],
  repeatPassword: [
    { required: true, message: 'Enter your password again', trigger: 'blur' },
    { validator: checkRepeat, trigger: 'blur' }
  ]
})

const zhRules = reactive({
  userName: [
    { required: true, message: '邮箱为空', trigger: 'blur' }
  ],
  identity_code: [
    { required: true, message: '验证码为空', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '密码为空', trigger: 'blur' },
    { validator: checkPassword, trigger: 'blur' }
  ],
  repeatPassword: [
    { required: true, message: '请再次输入你的密码', trigger: 'blur' },
    { validator: checkRepeat, trigger: 'blur' }
  ]
})

let timer = null
const getCode = () => {
  ruleFormRef.value.validateField(["userName"], isOk => {
    if (isOk) {
      data.loading = true
      timer = setInterval(() => {
        if (data.codeSecond > 0) {
          data.getCodeBtn = data.codeSecond--
        } else {
          if (locale.value === 'zh-cn') {
            data.getCodeBtn = '获取验证码'
          } else {
            data.getCodeBtn = 'Get Code'
          }
          data.codeSecond = 60
          data.loading = false
          window.clearInterval(timer)
        }
      }, 1000)
      sendEmailCode({
        email: data.formData.userName,
        appCode: 'nes'
      }).then(() => {
        if (locale.value === 'zh-cn') {
          ElMessage({
            message: '验证码发送成功',
            type: 'success',
          })
        } else {
          ElMessage({
            message: 'Verification code is sent successfully',
            type: 'success',
          })
        }
      })
    }
  })
}

const toRegister = () => {
  ruleFormRef.value.validate(isOk => {
    if (isOk) {
      if (!data.signLoading) {
        data.signLoading = true
        registerEmail({
          password: data.formData.password,
          email: data.formData.userName,
          vCode: data.formData.identity_code,
          inviteCode: data.formData.shareCode,
          defaultLogin: true,
          appCode: 'nes'
        }).then(res => {
          setSession('authToken', res.data.neverendsart_session)
          userStore.setIsLogin(true)
          router.push('/')
          trackEvent('Um_Event_RegisterSuc', '注册', '注册成功')
        }).catch(err => {
          trackEvent('Um_Event_RegisterFailed', '注册', err.message)
          if (err.errNo == 100007) {
            router.push('/login')
          } else {
            data.signLoading = false
          }
        })
      }
    }
  })
}

const toLogin = () => {
  router.push('/login')
}

const { formData, loading, getCodeBtn } = toRefs(data)
</script>

<style scoped lang="less">
/* 导入全局样式 */
@import "@/assets/styles/account.css";
</style>

<style scoped>

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flex-container {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.verification-btn {
  padding: 12px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.verification-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.verification-btn:disabled {
  background-color: var(--neutral-color);
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: var(--accent-color);
  cursor: pointer;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #0056b3;
}

@media (max-width: 768px) {
  .container {
    margin: 20px auto;
  }

  .card {
    flex-direction: column;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .form-input,
  .verification-btn,
  .submit-btn {
    padding: 10px;
    font-size: 14px;
  }
}
</style>