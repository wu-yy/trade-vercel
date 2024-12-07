<template>
  <div class="card">
    <div class="card-title">历史推荐交易对（过去24小时）</div>
    <table>
      <thead>
        <tr>
          <th>{{ $t('historicalrecommendations.time') }}</th>
          <th>{{ $t('historicalrecommendations.transaction') }}</th>
          <th>{{ $t('historicalrecommendations.score') }}</th>
          <th>{{ $t('historicalrecommendations.suggestion') }}</th>
          <th>{{ $t('historicalrecommendations.signal_strength') }}</th>
          <th>{{ $t('historicalrecommendations.suggest') }}</th>
          <th>{{ $t('historicalrecommendations.recommended_price') }}</th>
          <th>{{ $t('historicalrecommendations.current_price') }}</th>
          <th>{{ $t('historicalrecommendations.rise_and_fall') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredHistoricalData" :key="`${item.pair}-${item.timestamp}`">
          <td>{{ formatTime(item.timestamp) }}</td>
          <td>{{ item.pair }}</td>
          <td>{{ Math.abs(item.score).toFixed(2) }}</td>
          <td>
            <span :class="['recommendation', item.recommendation === '做多' ? 'long' : 'short']">
              {{ item.recommendation }}
            </span>
          </td>
          <td>{{ item.signalStrength.toFixed(1) }}%</td>
          <td>{{ item.holdingTime }}</td>
          <td>{{ item.recommendPrice.toFixed(4) }}</td>
          <td>{{ getCurrentPrice(item.pair).toFixed(4) }}</td>
          <td :class="getPriceChangeClass(item.pair)">
            {{ getPriceChange(item.pair) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
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

    onMounted(() => {
      fetchHistoricalData()
      fetchCurrentPrices()
      // 设置定时器，每分钟更新一次数据
      setInterval(() => {
        fetchHistoricalData()
        fetchCurrentPrices()
      }, 60000)
    })

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
.card {
  background-color: #ffffff;
  border-radius: 8px;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
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