<template>
    <div class="table-container">
      <div class="card-title">{{ $t('longhistoricalrecommendations.recent_record') }}</div>
      <div class="table-scroll">
      <table class="hist-rec-table">
        <thead>
          <tr>
            <!-- <th>{{ $t('longhistoricalrecommendations.time') }}</th> -->
            <th>{{ $t('longhistoricalrecommendations.transaction') }}</th>
            <!-- <th>{{ $t('longhistoricalrecommendations.score') }}</th> -->
            <!-- <th>{{ $t('longhistoricalrecommendations.suggestion') }}</th> -->
            <th>{{ $t('longhistoricalrecommendations.signal_strength') }}</th>
            <!-- <th>{{ $t('longhistoricalrecommendations.suggest') }}</th> -->
            <!-- <th>{{ $t('longhistoricalrecommendations.recommended_price') }}</th> -->
            <!-- <th>{{ $t('longhistoricalrecommendations.current_price') }}</th> -->
            <th>{{ $t('longhistoricalrecommendations.rise_and_fall') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredHistoricalData" :key="`${item.pair}-${item.timestamp}`">
            <!-- <td>{{ formatTime(item.timestamp) }}</td> -->
            <td>{{ item.pair }}</td>
            <!-- <td>{{ Math.abs(item.score).toFixed(2) }}</td> -->
            <!-- <td>
              <span :class="['recommendation', item.recommendation === '做多' ? 'long' : 'short']">
                {{ item.recommendation }}
              </span>
            </td> -->
            <td>{{ item.signalStrength.toFixed(1) }}%</td>
            <!-- <td>{{ item.holdingTime }}</td> -->
            <!-- <td>{{ item.recommendPrice.toFixed(4) }}</td> -->
            <!-- <td>{{ getCurrentPrice(item.pair).toFixed(4) }}</td> -->
            <td :class="getPriceChangeClass(item.pair)">
              {{ getPriceChange(item.pair) }}
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
</template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import axios from 'axios'
  
  export default {
    name: 'HistoricalRecommendations',
    setup() {
      const historicalData = ref([])
      const currentPrices = ref({})
  
      const filteredHistoricalData = computed(() => {
        const pairRecommendations = new Map()
        
        const sortedData = [...historicalData.value].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        )
        
        sortedData.forEach(item => {
          if (!pairRecommendations.has(item.pair)) {
            pairRecommendations.set(item.pair, [item])
          } else {
            const recommendations = pairRecommendations.get(item.pair)
            recommendations.push(item)
          }
        })
        
        return Array.from(pairRecommendations.values())
          .map(recommendations => [recommendations[0], recommendations[recommendations.length - 1]])
          .flat()
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      })
  
      const fetchHistoricalData = async () => {
        try {
          const response = await axios.get('/serverApi/crypto/historical_recommendations')
          historicalData.value = response.data
          console.log('Historical data:', historicalData.value) // 添加日志
        } catch (error) {
          console.error('Error fetching historical data:', error)
        }
      }
  
      const fetchCurrentPrices = async () => {
        try {
          const response = await axios.get('/serverApi/crypto/current_prices')
          currentPrices.value = response.data
          console.log('Current prices:', currentPrices.value) // 添加日志
        } catch (error) {
          console.error('Error fetching current prices:', error)
        }
      }
  
      const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
  
      const getCurrentPrice = (pair) => {
        const price = currentPrices.value[pair]
        if (price === undefined) {
          console.warn(`Current price not found for ${pair}`)
        }
        return price || 0
      }
  
      const getPriceChange = (pair) => {
        const currentPrice = parseFloat(getCurrentPrice(pair))
        const recommendation = historicalData.value.find(item => item.pair === pair)
        if (!recommendation) {
          console.warn(`No recommendation found for ${pair}`)
          return '0.00%'
        }
        const recommendPrice = parseFloat(recommendation.recommendPrice)
        if (isNaN(recommendPrice)) {
          console.warn(`Invalid recommend price for ${pair}`)
          return '0.00%'
        }
        if (currentPrice && recommendPrice) {
          const change = ((currentPrice - recommendPrice) / recommendPrice) * 100
          return change.toFixed(2) + '%'
        }
        return '0.00%'
      }
  
      const getPriceChangeClass = (pair) => {
        const change = parseFloat(getPriceChange(pair))
        return {
          'text-green-500': change > 0,
          'text-red-500': change < 0,
          'text-gray-500': change === 0
        }
      }

      const intervals = ref([]);
  
      onMounted(() => {
        fetchHistoricalData()
        fetchCurrentPrices()
        // 设置定时器，每分钟更新一次数据
        const intervalId = setInterval(() => {
          fetchHistoricalData()
          fetchCurrentPrices()
        }, 60000)
        intervals.value.push(intervalId);
      })
  
      // 添加组件卸载时的清理函数
      onUnmounted(() => {
        intervals.value.forEach(interval => clearInterval(interval));
        intervals.value = [];
      });

      return {
        filteredHistoricalData,
        formatTime,
        getCurrentPrice,
        getPriceChange,
        getPriceChangeClass
      }
    }
  }
  </script>
  
  <style scoped>
  /* 外部容器样式 */
  .table-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    /* padding: 0px; */
    /* border-radius: 0 30px 30px 0; */
    box-sizing: border-box;
    overflow: hidden; /* 确保子元素不溢出 */
    overscroll-behavior: none; /* 禁止上下弹性滚动 */
    /* box-shadow: 0 0px 6px rgba(0, 0, 0, 0.2);  */
  }

  .table-container::-webkit-scrollbar {
    display: none; /* 隐藏滚动条（Chrome、Safari） */
  }

  .card-title {
    font-size: 18px;
    font-weight: bold;
    margin: 15px 0px 15px 15px;
    position: relative;
    color: #007aff; /* 标题文字颜色 */
    display: flex;
    align-items: center;
  }
  
  /* 左侧粗线 */
  .card-title::before {
    content: ''; /* 伪元素内容为空 */
    display: inline-block;
    width: 4px; /* 线的宽度 */
    height: 100%; /* 线的高度，与文字居中对齐 */
    background-color: #8a9fff; /* 竖线颜色 */
    margin-right: 8px; /* 与文字的间距 */
    border-radius: 2px; /* 线条圆角 */
  }

  /* 滚动容器样式 */
  .table-scroll {
    flex: 1; /* 占据剩余高度 */
    overflow: auto;
    /* overflow: hidden; 确保子元素不溢出 */
    -webkit-overflow-scrolling: touch; /*提升触摸设备的滚动体验*/
    scrollbar-width: none; 
    overscroll-behavior: none; /* 禁止上下弹性滚动 */
  }

  /* 隐藏滚动条 */
  .table-scroll::-webkit-scrollbar {
    display: none; /* 隐藏滚动条（Chrome、Safari） */
  }

  .hist-rec-table {
    width: 100%; /* 表格宽度填满父容器 */
    max-width: 100%; /* 限制最大宽度，防止溢出 */
    height: 400px;
    border-collapse: collapse; /* 合并边框 */
    /* background-color: #e28e8e; */
    border-radius: 0 0 30px 0;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 四面均匀阴影 */
    /* overflow: auto; */
    table-layout: fixed;
    /* word-wrap: break-word; 强制单词换行 */
  }

  .hist-rec-table td {
    overflow: hidden; 
    text-overflow: ellipsis; /* 溢出时显示省略号 */
    white-space: nowrap; /* 如果需要一行显示，可用此设置 */
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .hist-rec-table th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
    font-weight: bold;
  }
  
  .recommendation {
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .long {
    background-color: #e6f4ea;
    color: #137333;
  }
  
  .short {
    background-color: #fce8e6;
    color: #c5221f;
  }
  </style>