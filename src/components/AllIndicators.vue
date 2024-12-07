<template>
  <div class="container">
  <div class="search-container">
    <h1 class="text-2xl font-bold mb-6 text-center">{{ $t('allindicators.all_contract_information') }}</h1>
    <!-- <div class="mb-6"> -->
    <div class="search-row">
      <input
        v-model="searchQuery"
        @keyup.enter="searchInstId"
        type="text"
        placeholder="搜索合约 (instId)"
        class="search-input"
      />
      <button
        @click="searchInstId"
        class="search-button"
      >{{ $t('allindicators.search') }}</button>
    </div>
    <div v-if="loading" class="text-center text-gray-600">
          Loading...
    </div>
  </div>

  <table class="indicators-table">
    <thead>
      <tr>
        <th @click="sortBy('instId')">{{ $t('allindicators.contract_name') }}<span v-if="sortKey === 'instId'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
        </th>
        <th @click="sortBy('trend_15m')">{{ $t('allindicators.fifteen__minute_growth_rate') }}<span v-if="sortKey === 'trend_15m'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
        </th>
        <th @click="sortBy('trend_30m')">{{ $t('allindicators.thirty_minutes_growth_rate') }}<span v-if="sortKey === 'trend_30m'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
        </th>
        <th @click="sortBy('trend_1h')">{{ $t('allindicators.one_hour_growth_rate') }}<span v-if="sortKey === 'trend_1h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
        </th>
        <th @click="sortBy('trend_4h')">{{ $t('allindicators.four__hour_growth_rate') }}<span v-if="sortKey === 'trend_4h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
        </th>
        <th @click="sortBy('trend_24h')">{{ $t('allindicators.twenty_four__hour_growth_rate') }}<span v-if="sortKey === 'trend_24h'">{{ sortOrder >= 0 ? '▲' : '▼' }}</span>
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
</template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
    name: 'AllIndicators',
    setup() {
      const allInstidPrices = ref([]);
      const searchQuery = ref('');
      const sortKey = ref('');
      const sortOrder = ref(1); // 1 for ascending, -1 for descending
      const loading = ref(false); // Loading state
  
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
      });
  
      return {
        allInstidPrices,
        searchQuery,
        sortKey,
        sortOrder,
        filteredAndSortedData,
        sortBy,
        loading
      };
    },
  };
  </script>

<style>
@import '@/assets/styles/search.css';
</style>

  <style scoped>
  
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
  
  /* .search-input {
    padding: 10px;
    margin-bottom: 10px;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
  } */
  </style>
  