<template>
  <div class="trading-pairs">
    <div class="controls">
      <div class="add-pair-form">
        <input v-model="newPair" placeholder="输入新交易对 (例如: LTC-USDT)" @keyup.enter="addPair">
        <button @click="addPair">{{ $t('tradingpairstable.add_to') }}</button>
      </div>
      <input v-model="filterValue" placeholder="筛选交易对..." @input="filterPairs">
      <select v-model="currentTimeframe" @change="filterTimeframe">
        <option value="all">{{ $t('tradingpairstable.all_time_framework') }}</option>
        <option v-for="tf in timeframes" :key="tf" :value="tf">{{ tf }}</option>
      </select>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>{{ $t('tradingpairstable.transaction') }}</th>
          <th>{{ $t('tradingpairstable.time_frame') }}</th>
          <th>RSI / Stoch RSI K / D</th>
          <th>MA 交叉</th>
          <th>MACD 交叉</th>
          <th>{{ $t('tradingpairstable.other_signals') }}</th>
          <th>{{ $t('tradingpairstable.superblock') }}</th>
          <th>{{ $t('tradingpairstable.ad_x') }}</th>
          <th>{{ $t('tradingpairstable.trend') }}</th>
          <th>{{ $t('tradingpairstable.suggestion') }}</th>
          <th>{{ $t('tradingpairstable.operate') }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in filteredTableData" :key="row.key">
          <tr>
            <td v-if="row.showPair" :rowspan="row.rowspan">
              {{ row.pair }}<br>
              <small>{{ formatTimestamp(row.timestamp) }}</small><br>
              <span v-if="row.alert" class="alert">{{ row.alert }}</span>
              <br>
              <span class="alert">得分: {{ row.totalScore }}</span>
            </td>
            <td>{{ row.timeframe }}</td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <template v-else>
                <span :class="getRsiClass(row.rsi)">{{ row.rsi.toFixed(2) }}</span> /
                <span :class="getStochRsiClass(row.stoch_rsi_k)">{{ row.stoch_rsi_k.toFixed(2) }}</span> /
                <span :class="getStochRsiClass(row.stoch_rsi_d)">{{ row.stoch_rsi_d.toFixed(2) }}</span>
              </template>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <span v-else-if="row.ema_cross" :class="getCrossClass(row.ema_cross)">{{ row.ema_cross }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <span v-else-if="row.macd_cross" :class="getCrossClass(row.macd_cross)">{{ row.macd_cross }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <template v-else>
                <span v-if="row.breakout" :class="getBreakoutClass(row.breakout)">{{ row.breakout }}</span>
                <span v-if="row.high_volatility" class="signal high-volatility">{{ $t('tradingpairstable.high_fluctuation') }}</span>
                <span v-if="row.volume_surge" class="signal volume-surge">{{ $t('tradingpairstable.surge_in_transaction_volume') }}</span>
                <span v-if="!row.breakout && !row.high_volatility && !row.volume_surge">-</span>
              </template>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <span v-else :class="getOverboughtOversoldClass(row.overbought_oversold)">{{ row.overbought_oversold }}</span>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <span v-else :class="getADXClass(row.adx)">{{ row.adx.toFixed(2) }}</span>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <span v-else :class="getTrendClass(row.trend)">{{ row.trend }}</span>
            </td>
            <td>
              <span v-if="row.noData" class="no-data">{{ $t('tradingpairstable.no_data') }}</span>
              <div v-else class="recommendation-container">
                <span :class="getRecommendationClass(row.minialert)">{{ row.minialert }}</span>
                <div v-if="row.minialert !== '观望'" class="recommendation-details">
                  <div v-if="row.signalStrength" class="signal-strength">
                    信号强度: {{ row.signalStrength.toFixed(1) }}%
                  </div>
                  <div v-if="row.holdingTime" class="holding-time">
                    {{ row.holdingTime }}
                  </div>
                </div>
              </div>
            </td>
            <td v-if="row.showPair" :rowspan="row.rowspan">
              <button @click="deletePair(row.pair)" class="delete-btn">{{ $t('tradingpairstable.delete') }}</button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'TradingPairsTable',
  setup() {
    const pairsData = ref({})
    const newPair = ref('')
    const filterValue = ref('')
    const currentTimeframe = ref('all')
    const timeframes = ['1H', '4H', '6H', '1D', '2D']

    const filteredTableData = computed(() => {
      const filteredData = Object.entries(pairsData.value)
        .filter(([pair]) => pair.toLowerCase().includes(filterValue.value.toLowerCase()))
        .flatMap(([pair, pairData]) => {
          return timeframes.map((tf, index) => {
            const tfData = pairData.data[tf] || { noData: true };
            const showTimeframe = currentTimeframe.value === 'all' || currentTimeframe.value === tf;
            if (!showTimeframe) return null;

            return {
              key: `${pair}-${tf}`,
              pair,
              timeframe: tf,
              showPair: index === 0 || currentTimeframe.value !== 'all',
              rowspan: currentTimeframe.value === 'all' ? timeframes.length : 1,
              timestamp: pairData.timestamp,
              alert: pairData.alerts ? pairData.alerts.join(', ') : null,
              totalScore: pairData.totalScore ? pairData.totalScore : null,
              recommendation: tfData.recommendation || '观望',
              signalStrength: tfData.signalStrength,
              holdingTime: tfData.holdingTime,
              minialert: tfData.minialert || '观望',
              ...tfData
            };
          }).filter(Boolean);
        });

      return filteredData;
    })

    const fetchData = async () => {
      try {
        const response = await axios.get('/serverApi/crypto/data')
        pairsData.value = response.data
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const addPair = async () => {
      try {
        const response = await axios.post('/serverApi/crypto/add_pair', { pair: newPair.value })
        if (response.data.success) {
          newPair.value = ''
          await fetchData()
        } else {
          console.error(response.data.message)
        }
      } catch (error) {
        console.error('Error adding pair:', error)
      }
    }

    const deletePair = async (pair) => {
      try {
        const response = await axios.post('/serverApi/crypto/delete_pair', { pair })
        if (response.data.success) {
          await fetchData()
        } else {
          console.error(response.data.message)
        }
      } catch (error) {
        console.error('Error deleting pair:', error)
      }
    }

    const formatTimestamp = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }

    const getRsiClass = (value) =>{{ $t('tradingpairstable.value') }}< 30 ? 'value-low' : value > 70 ? 'value-high' : ''
    const getStochRsiClass = (value) =>{{ $t('tradingpairstable.value') }}< 20 ? 'value-low' : value > 80 ? 'value-high' : ''
    const getCrossClass = (value) => value === '金叉' ? 'golden-cross' : 'death-cross'
    const getBreakoutClass = (value) => value === '突破上行' ? 'breakout-up' : 'breakout-down'
    const getOverboughtOversoldClass = (value) => value === '超买' ? 'overbought' : value === '超卖' ? 'oversold' : ''
    const getRecommendationClass = (value) => {
      switch (value) {
        case '做多':
          return 'long';
        case '做空':
          return 'short';
        case '观望':
          return 'neutral';
        default:
          return '';
      }
    }
    const getTrendClass = (value) => value === '上涨' ? 'trend-up' : 'trend-down'
    const getADXClass = (value) => {
      if (value < 20) return 'adx-weak';
      if (value < 40) return 'adx-moderate';
      return 'adx-strong';
    }

    onMounted(() => {
      fetchData()
      setInterval(() => {
        fetchData()
      }, 60000)
    })

    return {
      pairsData,
      newPair,
      filterValue,
      currentTimeframe,
      timeframes,
      filteredTableData,
      addPair,
      deletePair,
      formatTimestamp,
      getRsiClass,
      getStochRsiClass,
      getCrossClass,
      getBreakoutClass,
      getOverboughtOversoldClass,
      getRecommendationClass,
      getTrendClass,
      getADXClass
    }
  }
}
</script>

<style scoped>
.trading-pairs {
  width: 100%;
  overflow-x: auto;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.add-pair-form {
  display: flex;
}

.add-pair-form input,
.add-pair-form button,
input[type="text"],
select {
  font-size: 16px;
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.add-pair-form input,
input[type="text"] {
  width: 200px;
  margin-right: 10px;
}

.add-pair-form input:focus,
input[type="text"]:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.add-pair-form button {
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.add-pair-form button:hover {
  background-color: #0056b3;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--background-color-light);
  font-weight: bold;
}

.no-data {
  color: #8e8e93;
  font-style: italic;
}

.trend-up {
  color: #34c759;
}

.trend-down {
  color: #ff3b30;
}

.value-low {
  color: #34c759;
}

.value-high {
  color: #ff3b30;
}

.golden-cross {
  color: #ffd700;
}

.death-cross {
  color: #000000;
}

.breakout-up {
  color: #34c759;
}

.breakout-down {
  color: #ff3b30;
}

.overbought {
  color: #ff3b30;
}

.oversold {
  color: #34c759;
}

.long {
  color: #34c759;
  font-weight: bold;
}

.short {
  color: #ff3b30;
  font-weight: bold;
}

.neutral {
  color: #8e8e93;
}

.high-volatility,
.volume-surge {
  background-color: #ffcc00;
  color: #000000;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
}

.adx-weak {
  color: #8e8e93;
}

.adx-moderate {
  color: #ff9500;
}

.adx-strong {
  color: #ff3b30;
}

.delete-btn {
  background-color: #ff3b30;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #d63030;
}

.alert {
  color: #ff3b30;
  font-weight: bold;
}

.recommendation-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recommendation-details {
  font-size: 12px;
  color: #666;
}

.signal-strength {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.holding-time {
  display: inline-block;
  padding:  2px 6px;
  border-radius: 4px;
  background-color: #e6f4ea;
  color: #137333;
}
</style>