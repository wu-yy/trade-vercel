<template>
  <div class="login-page">
    <div class="login-card flex lg:flex-row flex-col">
      <!-- Left side content -->
      <div class="lg:w-1/2 w-full flex flex-col items-center justify-center p-8">
        <!-- Logo Image -->
        <div class="flex flex-col items-center mb-6">
          <img src="@/assets/img/alpha.jpg" alt="Alpha Logo" class="w-80 h-80 object-contain" />
        </div>
        <!-- Description text -->
        <div class="text-center text-gray-600 text-lg font-semibold">{{ $t('loginindex.the_most_timely_trading_prompt_information__grasp_the_transaction_market') }}</div>
      </div>
      
      <!-- Right side login form -->
      <div class="lg:w-1/2 w-full p-8">
        <h1>{{ $t('loginindex.mailbox_login') }}</h1>
        <el-form 
          ref="emailFormRef" 
          :rules="emailRules" 
          :model="emailData"
          class="login-form"
        >
          <el-form-item prop="userName" class="mb-6">
            <input 
              type="text" 
              v-model="emailData.userName" 
              placeholder="邮箱" 
              class="form-input"
            >
          </el-form-item>

          <!-- Verification code input and button -->
          <el-form-item prop="identity_code">
            <div class="flex-container">
              <input type="text" v-model="emailData.identity_code" placeholder="验证码" class="form-input verification-input">
              <button
                class="verification-btn"
                :disabled="emailData.loading"
                @click="getCode"
                type="button"
              >
                {{ emailData.getCodeBtn }}
              </button>
            </div>
          </el-form-item>

          <!-- Login button -->
          <el-form-item>
            <button
              class="submit-btn"
              @click="toLogin"
              type="button"
            >{{ $t('loginindex.log_in') }}</button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { loginEmailCode, sendEmailCode } from "@/http/api/user";
import { setSession } from "@/utils/tools";
import { useUserStore } from '@/store';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const { t } = useI18n();  // 在setup中获取t函数
const emailFormRef = ref(null);
const userStore = useUserStore();
const router = useRouter();
const showPassword = ref(false);

const emailData = reactive({
  userName: '',
  identity_code: '',
  loading: false,
  getCodeBtn: t('loginindex.get_code'),
  codeSecond: 60,
});

const emailRules = reactive({
  userName: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
  ]
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toLogin = () => {
  emailFormRef.value.validate(isOk => {
    if (isOk) {
      loginEmailCode({
        email: emailData.userName,
        VCode: emailData.identity_code,
        appCode: 'nes',
        inviteCode: ''
      }).then(res => {
        setSession("authToken", res.data.neverendsart_session);
        userStore.setIsLogin(true);
        router.push('/');
        ElMessage.success('登录成功');
      }).catch(err => {
        ElMessage.error(err.message || '登录失败');
      });
    }
  });
};

let timer = null
const getCode = () => {
  emailFormRef.value.validateField(["userName"], isOk => {
    if (isOk) {
      emailData.loading = true
      emailData.getCodeBtn = emailData.codeSecond; // 初始化按钮文本
      timer = setInterval(() => {
        if (emailData.codeSecond > 1) {
          emailData.codeSecond--;
          emailData.getCodeBtn = emailData.codeSecond;
        } else {
          window.clearInterval(timer);
          emailData.codeSecond = 60;
          emailData.loading = false;
          if (locale.value === 'zh-cn') {
            emailData.getCodeBtn = '获取验证码';
          } else {
            emailData.getCodeBtn = 'Get Code';
          }
        }
      }, 1000)
      sendEmailCode({
        email: emailData.userName,
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
</script>


<style scoped lang="less">
/* 导入全局样式 */
@import "@/assets/styles/account.css";
</style>

