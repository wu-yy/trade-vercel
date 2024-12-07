<template>
  <!-- <div class="sticky top-0 bg-black bg-opacity-60 z-50 w-full h-12 lg:h-16 flex items-center justify-between px-4 lg:px-6 xl:px-10 text-white"> -->
  <div class="header">
    <!-- 左侧导航 -->
    <nav class="header-container">
      <!-- 左侧菜单 -->
      <ul class="header-menu left-menu" :class="{ 'active': isMenuOpen }">
      <!-- <div class="hidden xl:flex items-center space-x-4"> -->
        <div class="header-item" @click="toNav('/')">
          {{ $t('header.recommend') }}
        </div>
        <div class="header-item" :class="{ active: data.curPathName === '/' }" @click="toNav('/market_all')">
          {{ $t('header.market_all') }}
        </div>
        <!-- <div class="header-item" :class="{ active: data.curPathName === '/' }" @click="toNav('/market_indicators')">{{ $t('header.market_indicator') }}</div> -->
        <!-- <div class="header-item" :class="{ active: data.curPathName === '/market_indicators' }" @click="toNav('/all_indicators')">{{ $t('header.all_contracts') }}</div> -->
        <!-- <div class="header-item" :class="{ active: data.curPathName === '/inst_search' }" @click="toNav('/inst_search')">{{ $t('header.contract_information_search') }}</div> -->
        <div class="header-item" :class="{ active: data.curPathName === '/twitter' }" @click="toNav('/twitter')">
          {{ $t('header.twitter') }}
        </div>
        <div class="header-item" :class="{ active: data.curPathName === '/announcement' }" @click="toNav('/announcement')"> 
          {{ $t('header.announcement') }}
        </div>
        <div class="header-item" :class="{ active: data.curPathName === '/membership' }" @click="toNav('/membership')">
          {{ $t('header.payment') }}
        </div>
      <!-- </div> -->
      </ul>
  
      <!-- 右侧导航 -->
      <ul class="header-menu right-menu" :class="{ 'active': isMenuOpen }">
      <!-- <div class="flex-1 xl:flex justify-end items-center space-x-4"> -->
        <div class="header-item" @click="loginOut" v-if="userStore.getIsLogin">
          {{ $t('header.logout') }}
        </div>
        <div class="header-item" :class="{ active: data.curPathName === '/login' }" @click="toNav('/login')" v-else>
          {{ $t('header.login') }}
        </div>
        <div class="header-item" @click="changeLang('zh-cn')">
          {{ $t('header.zh_cn') }}
        </div>
        <div class="header-item" @click="changeLang('en-us')">
          {{ $t('header.en_us') }}
        </div>
      <!-- </div> -->
      </ul>
  
      <!-- 折叠菜单按钮 -->
      <button class="menu-toggle" @click="toggleMenu">☰</button>
    <!-- </div> -->
    </nav>
  </div>
  </template>
  
  <script setup>
  import { reactive, defineExpose, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { debounce } from 'lodash';
  import { useUserStore } from "@/store";
  
  import { logout } from "@/http/api/user";
  import { loginInfo } from "@/http/api"
  import { getSession, clearSession, setSession} from '@/utils/tools'

  import { useI18n } from 'vue-i18n'
  const { locale } = useI18n()
  
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  
  const data = reactive({
    lang: "en-us",
    curPathName: "",
    showMenu: false,
    level: 0,
    lastTime: 0,
    membershipLevelRank: 0,
    remainingDays: 0
  })
  
  watch(() => route.name, (newVal) => {
    data.curPathName = newVal
  })
  
  const toNav = (url) => {
    router.push(url)
  }
  
  watch(() => userStore.isLogin, () => {
    loginInfo().then(res => {
      data.lastTime = res.data.time
      data.level = res.data.level
      data.membershipLevelRank = res.data.membershipLevelRank
      data.remainingDays = res.data.remainingDays
      userStore.setMembershipLevelRank(res.data.membershipLevelRank)
      userStore.setRemainingDays(res.data.remainingDays)
      userStore.setUserId(res.data.userId)
    })
  })
  
  const loginOut = debounce(() => {
    logout({
      atomechoSession: getSession("session"),
    }).then(() => {
      clearSession()
      userStore.setIsLogin(false)
      userStore.setMembershipLevelRank(0)
      userStore.setRemainingDays(0)
      userStore.setUserId(0)
      data.membershipLevelRank = 0
      data.remainingDays = 0
      data.lastTime = 0
      router.push('/')
    })
  }, 2000, { leading: true, trailing: false })
  
  defineExpose({
    data
  })
  
  
  onMounted(() => {
    data.lang = ""
    if (route.name) {
      data.curPathName = route.name
    }
    loginInfo().then(res => {
      data.lastTime = res.data.time
      data.level = res.data.level
      data.membershipLevelRank = res.data.membershipLevelRank
      data.remainingDays = res.data.remainingDays
      if (res.data.userId) {
        userStore.isLogin = true;
        userStore.setMembershipLevelRank(res.data.membershipLevelRank)
        userStore.setRemainingDays(res.data.remainingDays)
        userStore.setUserId(res.data.userId)
      } else {
        userStore.isLogin = false;
      }
    })
  })
  
  const changeLang = debounce((lang) => {
    locale.value = lang;
    data.lang = lang;
    setSession("lang", lang);
  }, 500, { leading: true, trailing: false })

  </script>
    
  <script>
  export default {
    data() {
      return {
        isMenuOpen: false, // 控制菜单的开关状态
      };
    },
    methods: {
      toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
      },
      selectItem(item) {
        this.selectedItem = item; // 更新选中状态
      },
    },
  };
  </script>
  
  <style scoped lang="less">
  /* 导入全局样式 */
  @import "@/assets/styles/header.css";
  </style>
  
    <!-- <style scoped>
    .header {
      background-color: var(--header-bg-color, black);
      color: var(--header-text-color, gold);
      padding: 10px 20px;
    }
    
    nav ul {
      list-style: none;
      display: flex;
      gap: 20px;
      margin: 0;
      padding: 0;
    }
    
    nav ul li {
      font-size: 16px;
      font-weight: bold;
    }
    
    .router-link-active {
      color: var(--accent-color, gold);
      border-bottom: 2px solid var(--accent-color, gold);
    }
    </style>
     -->