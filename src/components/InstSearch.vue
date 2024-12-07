<template>
  <div class="container">
    <!-- <div class="min-h-screen p-8"> -->
      <!-- <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6"> -->
      <div class="search-container">
        <h1 class="text-xl font-bold mb-6 text-center">{{ $t('instsearch.contract_information_query') }}</h1>
        <!-- <div class="mb-6"> -->
        <div class="search-row">
          <input
            v-model="searchQuery"
            @keyup.enter="searchInstId"
            type="text"
            placeholder="Enter InstId (e.g., BTC-USDT-SWAP)"
            class="search-input"
          />
          <button
            @click="searchInstId"
            class="search-button"
          >{{ $t('instsearch.search') }}</button>
        </div>
  
        <div v-if="loading" class="text-center text-gray-600">
          Loading...
        </div>
  
        <div v-else-if="error" class="text-center text-red-600">
          {{ error }}
        </div>
  
        <div v-else-if="klineData.length > 0">
              <div class="chart-and-data-container">
                  <!-- 图表容器 -->
                  <div ref="chartContainer" class="chart-container"></div>
                      <!-- 数据展示容器 -->
                      <div class="data-container">
                      <h2>{{ $t('instsearch.additional_data') }}</h2>
                      <ul>
                          <li>
                              {{ $t('instsearch.interest_trend') }}:
                              <span :style="{ color: getTrendDisplay(interestTrend).color }">
                                  {{ getTrendDisplay(interestTrend).text }}
                              </span>
                          </li>
                          <li>
                              {{ $t('instsearch.buy_trend') }}:
                              <span :style="{ color: getTrendDisplay(buyTrend).color }">
                                  {{ getTrendDisplay(buyTrend).text }}
                              </span>
                          </li>
                          <li>
                              {{ $t('instsearch.sell_trend') }}:
                              <span :style="{ color: getTrendDisplay(sellTrend).color }">
                                  {{ getTrendDisplay(sellTrend).text }}
                              </span>
                          </li>
                          <li>{{ $t('instsearch.last_buy_vol') }}: {{ lastBuyVol.toFixed(0) }} USDT
                          </li>
                          <li>
                              {{ $t('instsearch.last_sell_vol') }}: {{ lastSellVol.toFixed(0) }} USDT
                          </li>
                          <li>
                              {{ $t('instsearch.big_long_trend') }}:
                              <span :style="{ color: getTrendDisplay(bigLongTrend).color }">
                                  {{ getTrendDisplay(bigLongTrend).text }}
                              </span>
                          </li>
                          <li>
                              {{ $t('instsearch.big_short_trend') }}:
                              <span :style="{ color: getTrendDisplay(bigShortTrend).color }">
                                  {{ getTrendDisplay(bigShortTrend).text }}
                              </span>
                          </li>
                          <li>{{ $t('instsearch.global_long_trend') }}:
                              <span :style="{ color: getTrendDisplay(globalLongTrend).color }">
                                  {{ getTrendDisplay(globalLongTrend).text }}
                              </span>
                          </li>
                          <li>{{ $t('instsearch.global_short_trend') }}:
                              <span :style="{ color: getTrendDisplay(globalShortTrend).color }">
                                  {{ getTrendDisplay(globalShortTrend).text }}
                              </span>
                          </li>
                          <li>{{ $t('instsearch.last_big_long_account') }}: {{ ((lastBigLongAccount ?? 0) * 100).toFixed(2) }} %</li>
                          <li>{{ $t('instsearch.last_big_short_account') }}: {{ ((lastBigShortAccount ?? 0) * 100).toFixed(2) }} %</li>
                          <li>{{ $t('instsearch.last_global_long_account') }}: {{ ((lastGlobalLongAccount ?? 0) * 100).toFixed(2) }} %</li>
                          <li>{{ $t('instsearch.last_global_short_account') }}: {{ ((lastGlobalShortAccount ?? 0) * 100).toFixed(2) }} %</li>
                      </ul>
                  </div>
              </div>
          </div>
        <!-- <div v-else class="text-center text-gray-600">
          No data available. Please search for an InstId.
        </div> -->

        <!-- <div v-else-if="allInstidPrices" ref="allInstidPrices" class="all-instid-prices"> -->
        <table class="indicators-table">
          <thead>
              <tr>
                  <th @click="sortBy('instId')">{{ $t('instsearch.contract_name') }}<span v-if="sortKey === 'instId'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortBy('trend_15m')">{{ $t('instsearch.fifteen__minute_growth_rate') }}<span v-if="sortKey === 'trend_15m'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortBy('trend_30m')">{{ $t('instsearch.thirty_minutes_growth_rate') }}<span v-if="sortKey === 'trend_30m'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortBy('trend_1h')">{{ $t('instsearch.one_hour_growth_rate') }}<span v-if="sortKey === 'trend_1h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortBy('trend_4h')">{{ $t('instsearch.four__hour_growth_rate') }}<span v-if="sortKey === 'trend_4h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
                  <th @click="sortBy('trend_24h')">{{ $t('instsearch.twenty_four__hour_growth_rate') }}<span v-if="sortKey === 'trend_24h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
                  </th>
              </tr>
          </thead>
          <tbody>
              <tr
                  v-for="item in filteredAndSortedData"
                  :key="item.instId"
              >
                  <td>{{ item.instId }}</td>
                  <td>{{ item.trend_15m.toFixed(2) }}%</td>
                  <td>{{ item.trend_30m.toFixed(2) }}%</td>
                  <td>{{ item.trend_1h.toFixed(2) }}%</td>
                  <td>{{ item.trend_4h.toFixed(2) }}%</td>
                  <td>{{ item.trend_24h.toFixed(2) }}%</td>
              </tr>
          </tbody>
        </table>
      </div>
      </div>
    <!-- </div> -->
  <!-- </div> -->
</template>
  
<script>
import { ref, onMounted, watch, computed, nextTick} from 'vue';
import axios from 'axios';
import * as echarts from 'echarts';
import { getSession } from '@/utils/tools'

export default {
name: 'InstSearch',

setup() {
  const searchQuery = ref('');
  const klineData = ref([]);
  const loading = ref(false);
  const error = ref('');
  const chartContainer = ref(null);
  let chart = null;

  // 新增的响应式变量
  const interestTrend = ref(null);
  const buyTrend = ref(null);
  const sellTrend = ref(null);
  const lastBuyVol = ref(null);
  const lastSellVol = ref(null);
  const bigLongTrend = ref(null);
  const bigShortTrend = ref(null);
  const globalLongTrend = ref(null);
  const globalShortTrend = ref(null);
  const lastBigLongAccount = ref(null);
  const lastBigShortAccount = ref(null);
  const lastGlobalLongAccount = ref(null);
  const lastGlobalShortAccount = ref(null);

  const allInstidPrices = ref([]);
  const sortKey = ref('');
  const sortOrder = ref(1); // 1 for ascending, -1 for descending

  const searchInstId = async () => {
    if (!searchQuery.value) {
      console.log("instId is empty")
      return;
    }
  
    loading.value = true;
    error.value = '';
  
    try {
      console.log("searchInstId: ", searchQuery.value)
      // const response = await axios.post('/serverApi/crypto/get_instid_info', {
      //   instId: searchQuery.value
      // });
      const response = await axios.post('/serverApi/crypto/get_instid_info', {
        instId: searchQuery.value,
        hours: 24
      });
      console.log("searchInstId response 2333333: ", response.data)
      klineData.value = response.data.klines;
      // 提取额外的数据
      interestTrend.value = response.data.interest_trend;
      buyTrend.value = response.data.buy_trend;
      sellTrend.value = response.data.sell_trend;
      lastBuyVol.value = response.data.last_buy_vol;
      lastSellVol.value = response.data.last_sell_vol;
      bigLongTrend.value = response.data.big_long_trend;
      bigShortTrend.value = response.data.big_short_trend;
      globalLongTrend.value = response.data.global_long_trend;
      globalShortTrend.value = response.data.global_short_trend;
      lastBigLongAccount.value = response.data.last_big_Long_Account;
      lastBigShortAccount.value = response.data.last_big_short_Account;
      lastGlobalLongAccount.value = response.data.last_global_Long_Account;
      lastGlobalShortAccount.value = response.data.last_global_short_Account;

      console.log('Kline Data:', klineData.value);
      // renderChart();
    } catch (err) {
      console.error('Error fetching data:', err);
      error.value = 'Failed to fetch data. Please try again.';
    } finally {
      loading.value = false;
    }
  };

  const getTrendDisplay = (trend) => {
    const lang = getSession('lang')
      switch (trend) {
          case 'stable':
          return { text: lang === 'en-us' ? 'Stable' : '观望', color: 'gray' };
          case 'increasing':
          return { text: lang === 'en-us' ? 'Increasing' : '上升', color: 'green' };
          case 'decreasing':
          return { text: lang === 'en-us' ? 'Decreasing' : '下降', color: 'red' };
          default:
          return { text: trend, color: 'black' };
      }
  };
  
  const renderChart = async () => {
    await nextTick(); // 确保 DOM 渲染完成

    if (!chartContainer.value) {
      console.error('Chart container is not available.');
      return;
    }

    if (chartContainer.value) {
      chartContainer.value.style.width = '100%';
      chartContainer.value.style.height = '600px';
    }
  
    if (chart) {
      chart.dispose();
    }
  
    chart = echarts.init(chartContainer.value);

    console.log('Chart instance:', chart);
  
    const option = {
      title: {
        text: `${searchQuery.value} K线图`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'category',
        data: klineData.value.map(item => item.timestamp),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'K-line',
          type: 'candlestick',
          data: klineData.value.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]),
          itemStyle: {
            color: '#00da3c',
            color0: '#ec0000',
            borderColor: '#008F28',
            borderColor0: '#8A0000'
          }
        }
      ]
    };
  
    chart.setOption(option);
  };


  // Fetch all market indicators
  const fetchAllInstidPrices = async () => {
    loading.value = true; // Start loading
    try {
      const response = await axios.post('/serverApi/crypto/get_all_instd');
      console.log('Fetched data:', response.data);
      allInstidPrices.value = response.data.results;
    } catch (error) {
      console.warn('Error fetching data:', error);
    } finally {
      loading.value = false; // Set loading to false after fetching
    }
  };

  // Computed property for filtered and sorted data
  const filteredAndSortedData = computed(() => {
    let filteredData = allInstidPrices.value;

    // Filter based on search query
    if (searchQuery.value) {
      filteredData = filteredData.filter((item) =>
        item.instId.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // Sort based on the selected sortKey
    if (sortKey.value) {
      filteredData = filteredData.sort((a, b) => {
        const valueA = a[sortKey.value];
        const valueB = b[sortKey.value];
        return (valueA - valueB) * sortOrder.value;
      });
    }

    return filteredData;
  });

  // Function to handle sorting
  const sortBy = (key) => {
    if (sortKey.value === key) {
      // Toggle sort order if the same column is clicked
      sortOrder.value *= -1;
    } else {
      // Set new sort key and default to ascending
      sortKey.value = key;
      sortOrder.value = 1;
    }
  };

  onMounted(() => {
    fetchAllInstidPrices();
    window.addEventListener('resize', () => {
      if (chart) {
        chart.resize();
      }
    });
  });
  
  watch(klineData, async () => {
  if (klineData.value.length > 0) {
      await renderChart();
    }
  });
  
  return {
    allInstidPrices,
    searchQuery,
    klineData,
    chartContainer,
    chart,
    searchInstId,
    renderChart,
    sortKey,
    sortOrder,
    filteredAndSortedData,
    sortBy,
    loading,
    error,
    buyTrend,
    sellTrend,
    lastBuyVol,
    lastSellVol,
    bigLongTrend,
    bigShortTrend,
    globalLongTrend,
    globalShortTrend,
    lastBigLongAccount,
    lastBigShortAccount,
    lastGlobalLongAccount,
    lastGlobalShortAccount,
    getTrendDisplay
  };
}
}
</script>


<style>
  @import '@/assets/styles/search.css';
</style>

<style scoped>
.container {
  /* max-width: 2000px; */
  /* max-width: 100%; 占满整个屏幕宽度 */
  max-width: 90% !important;
  margin: auto !important;
  padding: 60px 0px 0px 0px;
  overflow: hidden;
  justify-content: center; /* 水平方向居中 */
  align-items: center; /* 垂直方向居中 */
  box-sizing: border-box; /* 包括内边距 */
}

.indicators-table {
width: 100%;
border-collapse: collapse;
margin: 20px 0 30px 0;
}

.indicators-table th,
.indicators-table td {
border: 1px solid #ddd;
padding: 10px;
text-align: center;
}

.indicators-table th {
background-color: #f4f4f4;
cursor: pointer;
user-select: none;
position: relative;
}

.indicators-table th:hover {
background-color: #e0e0e0;
}

.indicators-table th span {
margin-left: 5px;
font-size: 12px;
color: #666;
}

.chart-and-data-container {
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: flex-start;
}

.chart-container {
flex: 3; /* 图表占据更多空间 */
margin-right: 20px;
}

.data-container {
flex: 1; /* 数据容器占据较少空间 */
max-width: 300px;
}

.data-container h2 {
font-size: 18px;
margin-bottom: 10px;
}

.data-container ul {
list-style-type: none;
padding: 0;
}

.data-container li {
margin-bottom: 8px;
}

</style>
