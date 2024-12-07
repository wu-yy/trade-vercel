<template>
  <div class="recommended-container">
  <div
    class="recommended-pairs-container"
    @mouseover="showButtons"
    @mouseleave="hideButtons"
  >
    <!-- 左侧按钮 -->
    <button
      class="scroll-btn left-btn"
      v-show="buttonsVisible"
      @click="scrollLeft"
    >
      &lt;
    </button>

    <!-- 滑动区域 -->
    <div class="recommended-pairs-scroll" ref="scrollContainer">
      <div class="recommended-pairs">
        <div v-if="recommendedPairs.length === 0" class="no-recommendations">
          <p>{{ $t('longrecommendedpairs.there_is_no_recommended_transaction_pair') }}</p>
          <p>{{ $t('longrecommendedpairs.current_time') }}: {{ currentTime }}</p>
        </div>
        <div v-else v-for="pair in recommendedPairs" :key="pair[0]" class="recommended-pair">
          <h3 class="stock-name">{{ pair[0] }} <span class="star-icon">★</span> <!-- 星标图标 --> </h3>
          <div class="score">{{ Math.abs(pair[1]).toFixed(2) }}</div>
          <div :class="['direction', pair[2] === '做多' ? 'long' : 'short']">
            {{ $t(`longrecommendedpairs.${pair[2]}`) }}
          </div>
          <div class="signal-strength">{{ $t('longrecommendedpairs.signal_strength') }}: {{ pair[3].toFixed(1) }}%</div>
          <div class="holding-time">{{ $t('longrecommendedpairs.holding_time') }}: {{ pair[4] }}</div>
          <!-- <div class="holding-time">
            {{ $t('longrecommendedpairs.holding_time') }}: {{ $t(`longrecommendedpairs.${pair[4]}`) }}
          </div> -->
          <div class="adx">ADX: {{ pair[5].toFixed(2) }}</div>
          <div class="volatility">{{ $t('longrecommendedpairs.volatility') }}: {{ (pair[6] * 100).toFixed(2) }}%</div>
        </div>
      </div>
    </div>
    <!-- <div class="score-explanation">
        得分范围：-10 到 +10。正数表示做多信号强度，负数表示做空信号强度。绝对值越大，信号越强。
    </div> -->
    <!-- 右侧按钮 -->
    <button
      class="scroll-btn right-btn"
      v-show="buttonsVisible"
      @click="scrollRight"
    >
      &gt;
    </button>
  </div>
</div>
</template>

  
<script>
  import { ref, onMounted, onUnmounted } from 'vue'
  import axios from 'axios'
  import { getSession, clearSession, setSession} from '@/utils/tools'
  
  export default {
    name: 'RecommendedPairs',
    setup() {
      const recommendedPairs = ref([])
      const currentTime = ref('')
  
      const fetchRecommendedPairs = async () => {
        //  en-us  zh-cn
        const lang = getSession('lang')
        try {
          const params = {
            lang: lang
          }
          const response = await axios.post(`/serverApi/crypto/recommended_pairs`, params)
          recommendedPairs.value = response.data
          currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
        } catch (error) {
          console.error('Error fetching recommended pairs:', error)
        }
      }
      const intervals = ref([]);
      onMounted(() => {
        fetchRecommendedPairs()
        const intervalId = setInterval(fetchRecommendedPairs, 60000)
        intervals.value.push(intervalId);
      })

      // 添加组件卸载时的清理函数
      onUnmounted(() => {
        intervals.value.forEach(interval => clearInterval(interval));
        intervals.value = [];
      });
  
      return {
        recommendedPairs,
        currentTime
      }
    },

    data() {
      return {
        buttonsVisible: false,
      };
    },

    methods: {
      scrollLeft() {
        const container = this.$refs.scrollContainer;
        if (container) {
          container.scrollBy({ left: -300, behavior: "smooth" }); // 向左滚动
        } else {
          console.error("滑动容器未正确绑定");
        }
      },
      scrollRight() {
        const container = this.$refs.scrollContainer;
        if (container) {
          container.scrollBy({ left: 300, behavior: "smooth" }); // 向右滚动
        } else {
          console.error("滑动容器未正确绑定");
        }
      },
      showButtons() {
      this.buttonsVisible = true;
      },
      hideButtons() {
        this.buttonsVisible = false;
      },
    },
  }
</script>
  
  <style scoped lang="less">
  /* 导入全局样式 */
  @import "@/assets/styles/recommended-pairs.css";
  </style>