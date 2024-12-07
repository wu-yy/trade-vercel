<template>
    <div class="market-all-page">
      <!-- 左侧 - LongHistoricalRecommendations -->
      <div class="left-part">
        <MarketIndicators />
      </div>
  
      <!-- 中间 - LongRecommendedPairs 和 LongTradingPairsTable -->
      <div class="right-part">
        <!-- <div class="card-title">{{ $t('marketall.latest_recommendation') }}</div> -->
          <!-- <h2 class="panel-title">{{ $t('marketall.recommended_transaction_pair') }}</h2> -->
          <InstSearch />
        </div>
    </div>
</template>

<script>
import MarketIndicators from './MarketIndicators.vue'
import InstSearch from './InstSearch.vue'
import { ref } from 'vue'

export default {
    name: 'MarketAll',
    components: {
        MarketIndicators,
        InstSearch,
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
.market-all-page {
  display: flex;
  height: 100vh; /* 全屏高度 */
  width: 100vw; /* 全屏宽度 */
  padding: 0px 0 0 0;
  margin: 0;
  /* overflow: hidden; 防止内容溢出 */
}

.market-all-page .left-part {
  /* background-color: #f2f2f2; 浅灰色背景 #f2f2f2 */
  width: 60%; /* 左侧占 20% 宽度 */
  border-right: 1px solid #e0e0e0; /* 竖线分隔 */
  padding: 0px 0px 0 0px;
  box-sizing: border-box; /* 包含内边距 */
  /* height: 100%;  */
  border-radius: 0 0px 0px 0;
  margin: 50px 0px 0px 0px;
  overflow-y: auto;
  justify-content: center; /* 水平方向居中 */
  align-items: center; /* 垂直方向居中 */
  box-sizing: border-box; /* 包括内边距 */
}

.market-all-page .right-part {
  width: 40%; /* 占据整个屏幕宽度 */
  /* height: 100%; */
  background-color: white; /* 白色背景 */
  box-sizing: border-box; /* 包含内边距 */
  /* overflow-x: auto; */
  /* overflow: hidden; 防止内容溢出 */
  /* padding-right: 60px; */
  margin: 0px 0px 0px 0px;
  overflow-y: auto;
}

/* 隐藏滚动条 */
.left-part::-webkit-scrollbar {
display: none;
}

</style>