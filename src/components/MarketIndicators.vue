<template>
  <div class="container">
  <div class="summary">
      <h2 class="text-xl font-bold mb-6 text-center">{{ $t('marketindicators.market_traffic_summary') }}</h2>
      <div v-if="summary">
        <table class="summary-table">
          <thead>
            <tr>
              <th>{{ $t('marketindicators.interval') }}</th>
              <th>{{ $t('marketindicators.timestamp') }}</th>
              <th>{{ $t('marketindicators.positive_net_flow_ratio') }}</th>
              <th>{{ $t('marketindicators.negative_net_flow_ratio') }}</th>
              <th>{{ $t('marketindicators.buy_trend') }}</th>
              <th>{{ $t('marketindicators.sell_trend') }}</th>
              <th>{{ $t('marketindicators.net_flow_trend') }}</th>
              <!-- <th>{{ $t('marketindicators.timestamp') }}</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summary.summary" :key="item.interval">
              <td>{{ item.interval }}</td>
              <td>{{ item.timestamp }}</td>
              <td>{{ (item.positive_net_flow_ratio * 100).toFixed(2) }}%</td>
              <td>{{ (item.negative_net_flow_ratio * 100).toFixed(2) }}%</td>
              <td>
              <span :style="{ color: getTrendDisplay(item.buy_trend).color }">
                    {{ getTrendDisplay(item.buy_trend).text }}
              </span>
              </td>

              <td>
              <span :style="{ color: getTrendDisplay(item.sell_trend).color }">
                    {{ getTrendDisplay(item.sell_trend).text }}
              </span>
              </td>

              <td>
              <span :style="{ color: getTrendDisplay(item.net_flow_trend).color }">
                    {{ getTrendDisplay(item.net_flow_trend).text }}
              </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
</div>

<div class="charts-container"> 
  <h2 class="text-xl font-bold mb-6 text-center">{{ $t('marketindicators.market_net_inflow_curve') }}</h2>
    <div>
        <canvas ref="chartDataMarketFlowSummary"></canvas>
    </div>
</div>
    
<div class="charts-container">
  <h2 class="text-xl font-bold mb-6 text-center">{{ $t('marketindicators.the_main_indicator_of_the_broader_market') }}</h2>
    <div class="flex items-center justify-end mb-4 relative">
      <label for="timeRange" class="mr-2 font-semibold">Time Range:</label>
      <select 
        id="timeRange" 
        v-model="selectedTimeRange" 
        @change="handleTimeRangeChange"
        :disabled="userStore.membershipLevelRank === 0"
        :class="[
          'p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          userStore.membershipLevelRank === 0 ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800 cursor-pointer'
        ]"
      >
        <option value="24">Past 24 hours</option>
        <option value="48">Past 48 hours</option>
        <option value="168">Past week</option>
        <option value="336">Past 2 weeks</option>
      </select>
      <div v-if="userStore.membershipLevelRank === 0" class="absolute right-0 top-0 -mt-8">
        <button @click="showMembershipInfo" class="text-blue-500 hover:text-blue-700 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </button>
      </div>
    </div>
    <div>
        <canvas ref="chartDataAll"></canvas>
    </div>
    <div>
        <canvas ref="chartDataSelect"></canvas>
    </div>
    <div class="tags-container">
        <p class="tags-title">{{ $t('marketindicators.selected_data') }}</p>
        <div class="tags-list">
          <span v-for="(tag, index) in tags" :key="index" class="tag-item">
            {{ tag.trim() }}
          </span>
        </div>
    </div>
</div>
</div>
</template>
  
<script>
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { useUserStore } from "@/store"
import { useRouter } from 'vue-router'
import { getSession } from '@/utils/tools'

Chart.register(...registerables, zoomPlugin);
  
export default {

name: 'MarketIndicators',

data() {
  return {
    rawText: `
      NEAR-USDT-SWAP, DOGE-USDT-SWAP, APE-USDT-SWAP, XRP-USDT-SWAP,
      ADA-USDT-SWAP, POL-USDT-SWAP, SSV-USDT-SWAP, WLD-USDT-SWAP, 
      ETH-USDT-SWAP, WIF-USDT-SWAP, ORDI-USDT-SWAP, SOL-USDT-SWAP, 
      LUNA-USDT-SWAP, ICP-USDT-SWAP, YGG-USDT-SWAP, DYDX-USDT-SWAP, 
      PYTH-USDT-SWAP, AVAX-USDT-SWAP, MEME-USDT-SWAP, SHIB-USDT-SWAP, 
      SATS-USDT-SWAP, ATOM-USDT-SWAP, BNB-USDT-SWAP, JTO-USDT-SWAP, 
      BTC-USDT-SWAP, USDC-USDT-SWAP, SUI-USDT-SWAP, CETUS-USDT-SWAP
    `,
  };
},

computed: {
  tags() {
    return this.rawText.split(",").map(tag => tag.trim());
  },
},

setup() {

const userStore = useUserStore()
const selectedTimeRange = ref('48')

const router = useRouter()
const showMembershipInfo = () => {
  // Replace '/membership' with the actual path to your membership page
  router.push('/membership')
}

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

// 添加格式化函数
const formatNumber = (num) => {
    if (typeof num !== 'number') return num;
    
    const absNum = Math.abs(num);
    if (absNum >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    } else if (absNum >= 10000000) {
      return (num / 10000000).toFixed(2) + '千万';
    } else if (absNum >= 1000000) {
      return (num / 1000000).toFixed(2) + '百万';
    } else if (absNum >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toString();
};

const summary = ref()
const currentTime = ref('')

const fetchSummary = async () => {
  try {
    const response = await axios.post('/serverApi/crypto/market_summary')
    if (response.data) {
      summary.value = response.data
    }
    console.log("response:", summary.value)
  } catch (error) {
    console.error('Error fetching summary:', error)
  }
}

const chartDataAll = ref(null);
const chartDataSelect = ref(null);

const data_all = ref([])
const data_selected = ref([])

// 添加图表实例的引用
const chartInstances = ref({
  all: null,
  select: null,
  marketFlow: null
});

// 添加 intervals 的定义
const intervals = ref([]);

const createChart = (chartRef, data, label) => {
  const ctx = chartRef.value.getContext('2d');

  if (!Array.isArray(data)) {
    console.error(`${label} 数据无效:`, data);
    return;
  }

  // 销毁已存在的图表实例
  if (label === '所有数据' && chartInstances.value.all) {
    chartInstances.value.all.destroy();
  } else if (label === '精选数据' && chartInstances.value.select) {
    chartInstances.value.select.destroy();
  }

  const timestamps = data.map((item) => item.timestamp);
  const avgTrend1h = data.map((item) => item.avg_trend_1h || null);
  const avgTrend4h = data.map((item) => item.avg_trend_4h || null);
  const avgTrend24h = data.map((item) => item.avg_trend_24h || null);
  const avgTrend15Minutes = data.map((item) => item.avg_trend_15_minutes || null);
  const avgTrend30Minutes = data.map((item) => item.avg_trend_30_minutes || null);

  const lang = getSession('lang')

  // 动态翻译函数
  const translateLabel = (label, lang) => {
    const translations = {
      '15分钟趋势': lang === 'en-us' ? '15-minute Trend' : '15分钟趋势',
      '30分钟趋势': lang === 'en-us' ? '30-minute Trend' : '30分钟趋势',
      '1小时趋势': lang === 'en-us' ? '1-hour Trend' : '1小时趋势',
      '4小时趋势': lang === 'en-us' ? '4-hour Trend' : '4小时趋势',
      '24小时趋势': lang === 'en-us' ? '24-hour Trend' : '24小时趋势',
    };
    return translations[label] || label;
  };

  let new_label = label
  if (lang === 'en-us') {
    if (label == "所有数据") {
      new_label = "All Data"
    } else if (label == "精选数据") {
      new_label = "Selected Data"
    }
  }

  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [
        {
          label: `${new_label} - ${translateLabel('15分钟趋势', lang)}`,
          data: avgTrend15Minutes,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          fill: false,
        },
        {
          label: `${new_label} - ${translateLabel('30分钟趋势', lang)}`,
          data: avgTrend30Minutes,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
        },
        {
          label: `${new_label} - ${translateLabel('1小时趋势', lang)}`,
          data: avgTrend1h,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        },
        {
          label: `${new_label} - ${translateLabel('4小时趋势', lang)}`,
          data: avgTrend4h,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          fill: false,
        },
        {
          label: `${new_label} - ${translateLabel('24小时趋势', lang)}`,
          data: avgTrend24h,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        zoom: {
          pan: {
            enabled: true, // 启用拖动
            mode: 'y', // 仅允许纵向拖动
          },
          zoom: {
            wheel: {
              enabled: false, // 禁用鼠标滚轮缩放
            },
            pinch: {
              enabled: false, // 禁用双指缩放
            },
            mode: 'y', // 确保缩放模式也设置为纵向
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: lang === 'en-us' ? 'Timestamps' : '时间戳',
          },
        },
        y: {
          title: {
            display: true,
            text: lang === 'en-us' ? 'Trend Values (%)' : '趋势值 (%)',
          },
        },
      },
    },
  });

  // 保存图表实例
  if (label === '所有数据') {
    chartInstances.value.all = newChart;
  } else if (label === '精选数据') {
    chartInstances.value.select = newChart;
  }
};



const all_instid_prices = ref([])

const fetchIndicators = async () => {
    // /serverApi/crypto/average_price_signal
    try {
        // const response = await axios.post('/serverApi/crypto/average_price_signal');
        const request = {
          hours: parseInt(selectedTimeRange.value)
        }
        const response = await axios.post('/serverApi/crypto/average_price_signal', request);
        console.log("Fetched data:", response.data); // 打印数据检查
        // Extract data
        const d = response.data;
        data_all.value = d.data_all;
        data_selected.value = d.data_selected;
        console.log("102 data_all:", data_all.value)
        console.log("103 data_selected:", data_selected.value)
    } catch(error) {
        console.warn('No data returned, keeping previous values.');
    }
    // 模拟 API 数据
    // indicators.value = [
    //     { name: '成交量', value: '120,000,000' },
    //     { name: '涨跌幅', value: '+2.5%' },
    //     { name: '平均价格', value: '$25,000' }                   
    // ]
}

const handleTimeRangeChange = () => {
  if (userStore.membershipLevelRank === 0) {
    alert('Please purchase a membership to use this feature.')
    selectedTimeRange.value = '48' // Reset to default
    return
  }
  fetchIndicators()
}

watch(() => userStore.membershipLevelRank, (newRank) => {
  if (newRank === 0) {
    selectedTimeRange.value = '48' // Reset to default for non-members
  }
})


// 获取市场流入流出的曲线
const data_market_flow_summary = ref([])
const fetchMarketFlowSummary = async () => {
  try {
    const response = await axios.post('/serverApi/crypto/market_flow_summary_chart');
    console.log("response:", response.data)
    data_market_flow_summary.value = response.data
    console.log("data_market_flow_summary:", data_market_flow_summary.value)
  } catch (error) {
    console.error('Error fetching market flow summary:', error)
  }
}

const createMarketFlowSummaryChart = (chartRef, data, label) => {
  const ctx = chartRef.value.getContext('2d');

  // 销毁已存在的图表实例
  if (chartInstances.value.marketFlow) {
    chartInstances.value.marketFlow.destroy();
  }

  // 添加空值检查
  if (!chartRef.value) {
    console.error('Canvas element not found');
    return;
  }

  if (!Array.isArray(data)) {
    console.error(`${label} 数据无效:`, data);
    return;
  }

  const lang = getSession('lang');

  // 动态翻译函数
  const translateLabel = (label, lang) => {
    const translations = {
      '15分钟净流入': lang === 'en-us' ? '15-minute Net Flow' : '15分钟净流入',
      '1小时净流入': lang === 'en-us' ? '1-hour Net Flow' : '1小时净流入',
      '时间戳': lang === 'en-us' ? 'Timestamps' : '时间戳',
      '趋势值 (%)': lang === 'en-us' ? 'Trend Values (%)' : '趋势值 (%)',
    };
    return translations[label] || label;
  };

  let new_label = label
  if (lang === 'en-us') {
    if (label == "市场流量汇总") {
      new_label = "Market Flow Summary"
    }
  }

  const timestamps = data.map((item) => item.timestamp);
  const avgTrend1h = data.map((item) => item.data[1].net_flow || null);
  const avgTrend15Minutes = data.map((item) => item.data[0].net_flow || null);


  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [
        {
          label: `${new_label} - ${translateLabel('15分钟净流入', lang)}`,
          data: avgTrend15Minutes,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          fill: false,
        },
        {
          label: `${new_label} - ${translateLabel('1小时净流入', lang)}`,
          data: avgTrend1h,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        zoom: {
          pan: {
            enabled: true, // 启用拖动
            mode: 'y', // 仅允许纵向拖动
          },
          zoom: {
            wheel: {
              enabled: false, // 禁用鼠标滚轮缩放
            },
            pinch: {
              enabled: false, // 禁用双指缩放
            },
            mode: 'y', // 确保缩放模式也设置为纵向
          },
        },
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: translateLabel('时间戳', lang), // 根据语言动态设置 X 轴标题
          },
        },
        y: {
          title: {
            display: true,
            text: translateLabel('趋势值 (%)', lang), // 根据语言动态设置 Y 轴标题
          },
        },
      },
    },
  });
  chartInstances.value.marketFlow = newChart;
};

const chartDataMarketFlowSummary = ref(null);
onMounted(async () => {
  // 确保 DOM 完全加载后再执行
  await nextTick();
  // 初始化获取数据和创建图表
  await fetchMarketFlowSummary();
  if (chartDataMarketFlowSummary.value && data_market_flow_summary.value) {
    createMarketFlowSummaryChart(chartDataMarketFlowSummary, data_market_flow_summary.value, '市场流量汇总');
  }

  // 设置定时器
  const intervalId = setInterval(async () => {
    await fetchMarketFlowSummary();
    if (chartDataMarketFlowSummary.value && data_market_flow_summary.value) {
      createMarketFlowSummaryChart(chartDataMarketFlowSummary, data_market_flow_summary.value, '市场流量汇总');
    }
  }, 60000);

  intervals.value.push(intervalId);

  // fetchMarketFlowSummary().then(() => {
  //   createMarketFlowSummaryChart(chartDataMarketFlowSummary, data_market_flow_summary.value, '市场流量汇总');
  // });
  // setInterval(() => {
  //   fetchMarketFlowSummary().then(() => {
  //     createMarketFlowSummaryChart(chartDataMarketFlowSummary, data_market_flow_summary.value, '市场流量汇总');
  //   });
  // }, 60000);
})

onMounted(() => {
  fetchSummary();
  
  const intervalId = setInterval(() => {
    fetchSummary();
  }, 60000);
  intervals.value.push(intervalId);
});

onMounted(() => {
    fetchIndicators().then(() => {
        console.log("126 data_all:", data_all.value)
        console.log("127 data_selected:", data_selected.value)
      createChart(chartDataAll, data_all.value, '所有数据');
      createChart(chartDataSelect, data_selected.value, '精选数据');
    });
    const intervalId = setInterval(() => {
      fetchIndicators().then(() => {
        createChart(chartDataAll, data_all.value, '所有数据');
        createChart(chartDataSelect, data_selected.value, '精选数据');
      });
    }, 60000);
    intervals.value.push(intervalId);
    // all_instid_price()
})

// 添加组件卸载时的清理函数
onUnmounted(() => {
  // 清除所有图表实例
  Object.values(chartInstances.value).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
  });

  // 清除所有定时器
  intervals.value.forEach(interval => clearInterval(interval));
  intervals.value = [];
});

return {
    chartDataAll,
    getTrendDisplay,
    summary,
    formatNumber,
    chartDataSelect,
    selectedTimeRange,
    handleTimeRangeChange,
    userStore,
    chartDataMarketFlowSummary
}

}
}
</script>
  
<style scoped>
  .container {
      /* max-width: 2000px; */
      /* max-width: 100%; 占满整个屏幕宽度 */
      max-width: 90% !important;
      margin: auto !important;
      padding: 0px 0px 0px 0px;
      overflow: hidden;
      justify-content: center; /* 水平方向居中 */
      align-items: center; /* 垂直方向居中 */
      box-sizing: border-box; /* 包括内边距 */
  }

  /* 容器样式 */
  .tags-container {
    padding: 0px;
    /* background-color: #f9f9f9; */
    border-radius: 8px;
    margin-bottom: 30px;
  }
  
  /* 标题样式 */
  .tags-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center; /* 水平居中 */
  }
  
  /* 标签列表容器 */
  .tags-list {
    display: flex;
    flex-wrap: wrap; /* 自动换行 */
    gap: 10px; /* 标签之间的间距 */
  }
  
  /* 单个标签样式 */
  .tag-item {
    display: inline-block;
    background-color: #dee5d1; /* 背景颜色 */
    color: black; /* 字体颜色 */
    padding: 5px 10px;
    border-radius: 4px; /* 圆角 */
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .tag-item:hover {
    background-color: #a8d08d; /* 悬停时背景颜色 */
  }
  
  .market-indicators {
    padding: 20px;
  }
  
  .market-indicators ul {
    list-style: none;
    padding: 0;
  }
  
  .market-indicators ul li {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .charts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    }
  
    canvas {
    max-width: 100%;
    height: 400px;
    }
  
    /* Summary table styles */
  .summary {
  margin-top: 40px;
  }
  
  .summary-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  }
  
  .summary-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
  background-color: #fff;
  }
  
  .summary-table th,
  .summary-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  }
  
  .summary-table th {
  background-color: #f4f4f4;
  font-weight: bold;
  }
  
  th, td {
    border: 1px solid #e0e0e0; /* 添加单元格边框 */
    text-align: center; /* 单元格内容居中 */
    padding: 8px; /* 单元格内边距 */
  }

</style>
  