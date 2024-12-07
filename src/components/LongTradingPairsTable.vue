<template>
    <div class="trading-pairs">
      <div class="controls">
        <div class="add-pair-form" v-if="userStore.getUserId === 6708203963028">
          <input v-model="newPair" :placeholder="$t('longtradingpairstable.add_input_placeholder')"  @keyup.enter="addPair">
          <button @click="addPair">{{ $t('longtradingpairstable.add_to') }}</button>
        </div>
        <input v-model="filterValue" class="filter-pair-form" :placeholder="$t('longtradingpairstable.filter_input_placeholder')"  @input="filterPairs">
        <select v-model="currentTimeframe" @change="filterTimeframe">
          <option value="all">{{ $t('longtradingpairstable.all_time_framework') }}</option>
          <option v-for="tf in timeframes" :key="tf" :value="tf">{{ tf }}</option>
        </select>
      </div>
      
      <div class="trading-table">
      <table>
        <thead>
          <tr>
            <th>{{ $t('longtradingpairstable.transaction') }}</th>
            <th>{{ $t('longtradingpairstable.time_frame') }}</th>
            <th>RSI / Stoch RSI K / D</th>
            <th>{{ $t('longtradingpairstable.ma_cross') }}</th>
            <th>{{ $t('longtradingpairstable.macd_cross') }}</th>
            <th>{{ $t('longtradingpairstable.other_signals') }}</th>
            <th>{{ $t('longtradingpairstable.superblock') }}</th>
            <th>{{ $t('longtradingpairstable.ad_x') }}</th>
            <th>{{ $t('longtradingpairstable.trend') }}</th>
            <th>{{ $t('longtradingpairstable.suggestion') }}</th>
            <th v-if="userStore.getUserId === 6708203963028">{{ $t('longtradingpairstable.operate') }}</th>
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
                <span class="alert">{{ $t('longtradingpairstable.total_score') }}: {{ row.totalScore }}</span>
              </td>
              <td>{{ row.timeframe }}</td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <template v-else>
                  <span :class="getRsiClass(row.rsi)">{{ row.rsi.toFixed(2) }}</span> /
                  <span :class="getStochRsiClass(row.stoch_rsi_k)">{{ row.stoch_rsi_k.toFixed(2) }}</span> /
                  <span :class="getStochRsiClass(row.stoch_rsi_d)">{{ row.stoch_rsi_d.toFixed(2) }}</span>
                </template>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <span v-else-if="row.ema_cross" :class="getCrossClass(row.ema_cross)">{{ $t(`longrecommendedpairs.${row.ema_cross}`) }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <span v-else-if="row.macd_cross" :class="getCrossClass(row.macd_cross)">{{ $t(`longrecommendedpairs.${row.macd_cross}`) }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <template v-else>
                  <span v-if="row.breakout" :class="getBreakoutClass(row.breakout)">{{ $t(`longrecommendedpairs.${row.breakout}`) }}</span>
                  <span v-if="row.high_volatility" class="signal high-volatility">{{ $t('longtradingpairstable.high_fluctuation') }}</span>
                  <span v-if="row.volume_surge" class="signal volume-surge">{{ $t('longtradingpairstable.surge_in_transaction_volume') }}</span>
                  <span v-if="!row.breakout && !row.high_volatility && !row.volume_surge">-</span>
                </template>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <span v-else :class="getOverboughtOversoldClass(row.overbought_oversold)">{{ $t(`longrecommendedpairs.${row.overbought_oversold}`) }}</span>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <span v-else :class="getADXClass(row.adx)">{{ row.adx.toFixed(2) }}</span>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <span v-else :class="getTrendClass(row.trend)">{{ $t(`longrecommendedpairs.${row.trend}`) }}</span>
              </td>
              <td>
                <span v-if="row.noData" class="no-data">{{ $t('longtradingpairstable.no_data') }}</span>
                <div v-else class="recommendation-container">
                  <span :class="getRecommendationClass(row.minialert)">{{ $t(`longrecommendedpairs.${row.minialert}`) }}</span>
                  <div v-if="row.minialert !== '观望'" class="recommendation-details">
                    <div v-if="row.signalStrength" class="signal-strength">
                      {{ $t('longtradingpairstable.signal_strength') }}: 
                      {{ row.signalStrength.toFixed(1) }}%
                    </div>
                    <div v-if="row.holdingTime" class="holding-time">
                      {{ row.holdingTime }}
                    </div>
                  </div>
                </div>
              </td>
              <td v-if="row.showPair && userStore.getUserId === 6708203963028 " :rowspan="row.rowspan">
                <button @click="deletePair(row.pair)" class="delete-btn">{{ $t('longtradingpairstable.delete') }}</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  import { useUserStore } from '@/store'
  import { getSession } from '@/utils/tools'

  
  export default {
    name: 'TradingPairsTable',
    setup() {

      const userStore = useUserStore()
      const pairsData = ref({})
      const newPair = ref('')
      const filterValue = ref('')
      const currentTimeframe = ref('all')
      const timeframes = ['1H', '4H', '6H', '1D', '2D']
  
      const filteredTableData = computed(() => {
        const filteredData = Object.entries(pairsData.value)
          .filter(([pair]) => pair.toLowerCase().includes(filterValue.value.toLowerCase()))
          .flatMap(([pair, pairData]) => {
            if (!pairData || !pairData.data || typeof pairData.data !== 'object') {
              console.warn(`Invalid pairData for pair: ${pair}`);
              return [];
            }
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
          const lang = getSession('lang')
          const response = await axios.post('/serverApi/crypto/data', { lang: lang })
          pairsData.value = response.data
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
  
      const addPair = async () => {
        try {
          const response = await axios.post('/serverApi/crypto/add_pair', { pair: newPair.value })
          if (response.data.success) {
            alert(`添加交易对${newPair.value}成功`)
            newPair.value = ''
            await fetchData()
          } else {
            console.error(response.data.message)
            alert(`添加交易对${newPair.value}失败`)
          }
        } catch (error) {
          console.error('Error adding pair:', error)
          alert(`添加交易对${newPair.value}失败`)
        }
      }
  
      const deletePair = async (pair) => {
        try {
          const response = await axios.post('/serverApi/crypto/delete_pair', { pair })
          if (response.data.success) {
            await fetchData()
            alert(`删除交易对${pair}成功`)
          } else {
            console.error(response.data.message)
            alert(`删除交易对${pair}失败`)
          }
        } catch (error) {
          console.error('Error deleting pair:', error)
          alert(`删除交易对${pair}失败`)
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

      const getRsiClass = (value) => value < 30 ? 'value-low' : value > 70 ? 'value-high' : ''
      const getStochRsiClass = (value) => value < 20 ? 'value-low' : value > 80 ? 'value-high' : ''
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
      
      const intervals = ref([]);
      onMounted(() => {
        fetchData()
        const intervalId = setInterval(() => {
          fetchData()
        }, 60000)
        intervals.value.push(intervalId);
      })

      // 添加组件卸载时的清理函数
      onUnmounted(() => {
        intervals.value.forEach(interval => clearInterval(interval));
        intervals.value = [];
      });
  
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
        userStore,
        getADXClass
      }
    }
  }
  </script>
  
  <style scoped lang="less">
  /* 导入全局样式 */
  @import "@/assets/styles/longtradingpairstable.css";

  .add-pair-form input,
  .add-pair-form button,
  input[type="text"],
  select {
      font-size: 16px;
      padding: 5px 15px;
      border-radius: 30px;
      border: 1px solid var(--border-color);
      background-color: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      margin: 10px;
  }

  .add-pair-form input,
  input[type="text"] {
      width: 300px;
      margin: 10px 0 10px 20px;
      border-radius: 30px 0 0 30px;
  }

  .add-pair-form input:focus,
  input[type="text"]:focus,
  select:focus {
      outline: none;
      // box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
  }

  .add-pair-form button {
    background-color: var(--accent-color);
    color: #ffffff;
    border: none;
    cursor: pointer;
    height: fit-content;
    /* width: 30px; */
    width: max-content;
    border-radius: 0px 30px 30px 0;
    border: 1px solid var(--accent-color);
    margin: 0;
  }

  // .add-pair-form button:hover {
  //     background-color: #007bff;
  // }

  table {
      width: 100%;
      border-collapse: collapse;
      /* margin-bottom: 20px; */
      border-left: none; /* 隐藏左侧框线 */
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

  </style>