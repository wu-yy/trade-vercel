<template>
  <div class="container">
  <div class="module-container">
    <!-- 模块 1 -->
    <div class="module">
      <LongRecommendedPairs />
    </div>
    <!-- 模块 2 -->
    <div class="module">
      <LongHistoricalRecommendations />
    </div>
    <!-- 模块 3 -->
    <div class="module">
      <LongTradingPairsTable />
    </div>
    <div id="loadingOverlay" v-show="loading">
        <div class="spinner"></div>
    </div>
    <div id="message" :class="messageClass">{{ message }}</div>
  </div>
  </div>
</template>
  
  <script>
  import LongRecommendedPairs from './LongRecommendedPairs.vue'
  import LongHistoricalRecommendations from './LongHistoricalRecommendations.vue'
  import LongTradingPairsTable from './LongTradingPairsTable.vue'
  import { ref } from 'vue'
  
  export default {
    name: 'LongRecomm',
    components: {
      LongRecommendedPairs,
      LongHistoricalRecommendations,
      LongTradingPairsTable
    },
    setup() {
      const loading = ref(false)
      const message = ref('')
      const messageClass = ref('')
  
      const showMessage = (msg, isError = false) => {
        message.value = msg
        messageClass.value = isError ? 'error show' : 'success show'
        setTimeout(() => {
          messageClass.value = ''
        }, 3000)
      }
  
      return {
        loading,
        message,
        messageClass,
        showMessage
      }
    }
  }
  </script>
  
  <style scoped>
  @import '../assets/styles/main.css';

  /* 设置模块之间的间隔 */
  .module {
    margin-bottom: 60px; /* 每个模块底部的间隔 */
  }

  /* 如果需要页面左右留白 */
  .module-container {
    padding: 0px; /* 为整个模块区域设置内边距 */
  }

  #loadingOverlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
  }
  
  .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid var(--accent-color);
      border-top: 5px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
  
  #message {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(5px);
  }
  
  #message.show {
      opacity: 1;
  }
  
  #message.success {
      background-color: rgba(52, 199, 89, 0.2);
      color: var(--long-color);
  }
  
  #message.error {
      background-color: rgba(255, 59, 48, 0.2);
      color: var(--short-color);
  }
  </style>