<template>
<div class="market-all-page">
  <div class="min-h-screen bg-[#1C1D21] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-white text-center mb-4">{{ $t('membershippage.subscription_service') }}</h1>
      
      <!-- Points Display -->
      <div class="text-center mb-8">
        <div class="text-gray-400 mb-1">
          {{ $t('membershippage.my_current_membership') }}: <span class="text-white">{{ $t(`membershippage.${currentMembership}`) }}</span> {{ $t('membershippage.remaining_days') }}: <span class="text-white">{{ currentMembershipDays }}</span>
          <br>
          <a href="#" class="text-[#4A90E2] ml-2 hover:underline">{{ $t('membershippage.click_the_list_below_to_upgrade_the_membership') }}</a>
        </div>
        <div class="text-sm text-gray-500">{{ $t('membershippage.one_point_is_equal_to_one_usdt') }}</div>
      </div>

      <!-- VIP Banner -->
      <div class="bg-[#2A2B2F] rounded-lg p-4 mb-4 flex justify-between items-center">
        <div class="text-white">
          <span class="text-[#D4B572]">{{ $t('membershippage.vip_advanced_service') }}</span>
          <span class="text-[#FFA940] ml-2">{{ $t('membershippage.limited_time') }}</span>
          <span class="text-gray-400 text-sm ml-2">{{ $t('membershippage.join_the_telegram_group_to_receive_a_limited_time_discount') }}</span>
        </div>
        <button 
          @click="claimPromotion" 
          class="bg-[#FFA940] text-white px-6 py-2 rounded-md hover:bg-[#E89935] transition-colors duration-300"
        >{{ $t('membershippage.receive') }}</button>
      </div>

      <!-- Login Button (shown when user is not logged in) -->
      <div v-if="!userStore.isLogin" class="text-center mb-8">
        <button 
          @click="redirectToLogin" 
          class="bg-[#4A90E2] text-white px-8 py-3 rounded-md hover:bg-[#3A80D2] transition-colors duration-300 text-lg font-semibold"
        >{{ $t('membershippage.log_in_to_view_membership_options') }}</button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center text-white">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>

      <!-- Product Grid (shown only when user is logged in) -->
      <div v-else-if="userStore.isLogin" class="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <ProductItem
          v-for="category in groupedProducts"
          :key="category.membershipLevel"
          :category="category"
          :selectedProductId="selectedProductId"
          @select="handleProductSelect"
          @purchase="purchaseProduct"
        />
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ProductItem from './ProductItem.vue';
import Http from '@/http/http.js';
import { useUserStore } from '@/store/modules/user/index.js';

import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const { t } = useI18n();  // 在setup中获取t函数

const products = ref([]);
const router = useRouter();
const isLoading = ref(false);
const userStore = useUserStore();
const currentMembership = ref('未订阅');
const currentMembershipDays = ref(0);
const selectedProductId = ref(null);

const groupedProducts = computed(() => {
  const grouped = {};
  products.value.forEach(product => {
    if (!grouped[product.membershipLevel]) {
      grouped[product.membershipLevel] = {
        // 根据会员等级名称显示会员等级，从language中获取
        membershipLevel: t(`membershippage.${product.membershipLevel}`),  // 将 $t 改为 t
        membershipLevelRank: product.membershipLevelRank,
        options: []
      };
    }
    grouped[product.membershipLevel].options.push(product);
  });
  return Object.values(grouped).sort((a, b) => a.membershipLevelRank - b.membershipLevelRank);
});

const fetchCurrentMembership = async () => {
  try {
    const { data } = await Http.get('/crypto/membership');
    currentMembership.value = data.membership_level || '未订阅';
    currentMembershipDays.value = data.remaining_days || 0;
    userStore.setIsLogin(true);
  } catch (error) {
    handleError(error, '获取当前会员等级失败');
    currentMembership.value = '未订阅';
    currentMembershipDays.value = 0;
    userStore.setIsLogin(false);
  }
};

const handleProductSelect = (productId) => {
  selectedProductId.value = productId;
};

const fetchProducts = async () => {
  if (!userStore.isLogin) return;
  
  isLoading.value = true;
  try {
    const { data } = await Http.get('/crypto/products');
    products.value = data.products;
  } catch (error) {
    handleError(error, '获取商品列表失败');
  } finally {
    isLoading.value = false;
  }
};

const purchaseProduct = async (productId) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const { data } = await Http.post('/crypto/purchase', { product_id: productId });
    const paymentUrl = data.payment_url || data.PaymentUrl;
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      ElMessage.success('已打开支付页面，请完成支付');
    } else {
      throw new Error('获取支付链接失败');
    }
  } catch (error) {
    handleError(error, '购买失败，请登录后重试');
  } finally {
    isLoading.value = false;
  }
};

const claimPromotion = () => {
  // if (!userStore.isLogin) {
  //   ElMessage.warning('请先登录以领取优惠');
  //   return;
  // }
  const telegramLink = 'https://t.me/CryptoAlphaOnline';
  window.open(telegramLink, '_blank');
  ElMessage.success('已打开Telegram群链接，请加入群组以获取优惠');
};

const handleError = (error, defaultMessage) => {
  if (error.errNo) {
    ElMessage.error(error.errMsg || defaultMessage);
    if (error.errNo === 3) {
      userStore.setIsLogin(false);
      router.push('/login');
    }
  } else {
    ElMessage.error(error.message || '请求失败');
  }
  console.error(error);
};

const redirectToLogin = () => {
  router.push('/login');
};

onMounted(async () => {
  if (userStore.isLogin) {
    await fetchCurrentMembership();
    await fetchProducts();
  }
});
</script>


<style scoped>
@import '../assets/styles/main.css';
  /* 设置模块之间的间隔 */
  .module {
    /* margin-bottom: 60px; 每个模块底部的间隔 */
  }

  /* 如果需要页面左右留白 */
  .module-container {
    padding: 0px; /* 为整个模块区域设置内边距 */
  }

.market-all-page {
  display: flex;
  min-height: 100vh;
  padding: 0px 0 0 0;
  margin: 0;
  overflow: hidden; /* 防止内容溢出 */
  /* overflow: hidden; 防止内容溢出 */
}

/* Add this to ensure the content stays within bounds */
.min-h-screen {
  width: 100%;
  margin-top: 60px; /* Adjust this value based on your header height */
  overflow-x: hidden;
}

/* Keep other existing styles */
.module-container {
  padding: 0;
}
</style>
