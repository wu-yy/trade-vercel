<template>
    <div class="payment-result">
      <h1>{{ $t('paymentresult.payment_result') }}</h1>
      <div v-if="loading">正在查询支付结果，请稍候...</div>
      <div v-else-if="success">
        <p>支付成功！订单号：{{ orderId }}</p>
      </div>
      <div v-else>
        <p>支付失败，请重试！订单号：{{ orderId }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        orderId: this.$route.query.order_id, // 从 URL 参数获取订单号
        success: false,
        loading: true,
      };
    },
    async created() {
      try {
        const response = await axios.get(
          `/serverApi/crypto/check_status?order_id=${this.orderId}`
        );
        if (response.data.status === 'success') {
          this.success = true;
        }
      } catch (error) {
        console.error('查询支付状态失败', error);
      } finally {
        this.loading = false;
      }
    },
  };
  </script>
  
  <style scoped>
  .payment-result {
    text-align: center;
    margin-top: 20px;
  }
</style>
  