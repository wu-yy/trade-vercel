<template>
  <div class="container">
    <!-- <div class="min-h-screen p-8"> -->
      <!-- <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6"> -->
      <div class="search-container">
        <h1 class="text-2xl font-bold mb-6 text-center">{{ $t('instidinfo.single_contract_information_query') }}</h1>
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
          >{{ $t('instidinfo.search') }}</button>
        </div>
  
        <div v-if="loading" class="text-center text-gray-600">
          Loading...
        </div>
  
        <div v-else-if="error" class="text-center text-red-600">
          {{ error }}
        </div>
  
        <div v-else-if="klineData.length > 0" ref="chartContainer" class="chart-container"></div>
  
        <div v-else class="text-center text-gray-600">
          No data available. Please search for an InstId.
        </div>
      </div>
    <!-- </div> -->
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import axios from 'axios';
  import * as echarts from 'echarts';
  import { nextTick } from 'vue';

  
  const searchQuery = ref('');
  const klineData = ref([]);
  const loading = ref(false);
  const error = ref('');
  const chartContainer = ref(null);
  let chart = null;
  
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

      console.log('Kline Data:', klineData.value);
      // renderChart();
    } catch (err) {
      console.error('Error fetching data:', err);
      error.value = 'Failed to fetch data. Please try again.';
    } finally {
      loading.value = false;
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
  
  onMounted(() => {
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
  </script>
  

  <style>
  @import '@/assets/styles/search.css';
  </style>