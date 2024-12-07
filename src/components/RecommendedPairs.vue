<template>
  <div class="card">
    <!-- Summary Section -->
    <div class="summary">
      <div class="summary-title">{{ $t('recommendedpairs.market_traffic_summary') }}</div>
      <div v-if="summary">
        <table class="summary-table">
          <thead>
            <tr>
              <th>{{ $t('recommendedpairs.interval') }}</th>
              <th>{{ $t('recommendedpairs.net_traffic') }}</th>
              <th>{{ $t('recommendedpairs.positive_flow_ratio') }}</th>
              <th>{{ $t('recommendedpairs.total_buying_changes') }}</th>
              <th>{{ $t('recommendedpairs.total_selling_changes') }}</th>
              <th>{{ $t('recommendedpairs.timestamp') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summary.summary" :key="item.interval">
              <td>{{ item.interval }}</td>
              <td>{{ item.net_flow }}</td>
              <td>{{ (item.positive_flow_ratio * 100).toFixed(2) }}%</td>
              <td>{{ item.total_buy_change }}</td>
              <td>{{ item.total_sell_change }}</td>
              <td>{{ new Date(item.timestamp).toLocaleString('zh-CN', { hour12: false }) }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Horizontal Table for Markers -->
        <div class="marker-table-wrapper">
          <table class="marker-table">
            <thead>
              <tr>
                <th>{{ $t('recommendedpairs.fifteen_minutes_net_inflow') }}</th>
                <th>{{ $t('recommendedpairs.fifteen_minutes_clean_out') }}</th>
                <th>{{ $t('recommendedpairs.one_hour_net_inflow') }}</th>
                <th>{{ $t('recommendedpairs.one_hour_net_outflow') }}</th>
                <th>{{ $t('recommendedpairs.four_hours_net_inflow') }}</th>
                <th>{{ $t('recommendedpairs.four_hours_clean_out') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ summary.mark_15m_net_flow_in ? '是' : '否' }}</td>
                <td>{{ summary.mark_15m_net_flow_out ? '是' : '否' }}</td>
                <td>{{ summary.mark_1h_net_flow_in ? '是' : '否' }}</td>
                <td>{{ summary.mark_1h_net_flow_out ? '是' : '否' }}</td>
                <td>{{ summary.mark_4h_net_flow_in ? '是' : '否' }}</td>
                <td>{{ summary.mark_4h_net_flow_out ? '是' : '否' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="card-title">{{ $t('recommendedpairs.recommended_transaction_pair') }}</div>
    <div class="recommended-pairs">
      <div v-if="!(recommendedPairs.long || recommendedPairs.short)" class="no-recommendations">
        <p>{{ $t('recommendedpairs.there_is_no_recommended_transaction_pair') }}</p>
        <p>更新时间: {{ currentTime }}</p>
      </div>
      <div v-else>
        <h2>{{ $t('recommendedpairs.recommend_more_transaction_pairs') }}</h2>
        <div v-if="recommendedPairs.long && recommendedPairs.long.length > 0" class="long-recommendations">
          <table class="pairs-table">
            <thead>
              <tr>
                <th>{{ $t('recommendedpairs.transaction') }}</th>
                <th>{{ $t('recommendedpairs.timestamp') }}</th>
                <th>盈利比 % </th>
                <th>{{ $t('recommendedpairs.recommend') }}</th>
                <th>{{ $t('recommendedpairs.total_score') }}</th>
                <th>{{ $t('recommendedpairs.fifteen_minutes_data') }}</th>
                <th>{{ $t('recommendedpairs.long_cycle_data') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pair in recommendedPairs.long" :key="pair.inst_id">
                <td>{{ pair.inst_id }}</td>
                <td>{{ new Date(pair.latest_timestamp).toLocaleString('zh-CN', { hour12: false }) }}</td>
                <td>{{ pair.profit_rate }}</td>
                <!-- <td>{{ pair.data_15m.recommendation }}</td> -->
                <td>{{ $t('recommendedpairs.do_more') }}</td>
                <td>{{ pair.latest_data_15m.score }}</td>
                <td>
                  <ul>
                    <li v-for="(value, key) in pair.latest_data_15m" :key="key">{{ key }}: {{ formatValue(value) }}</li>
                  </ul>
                </td>
                <td>
                  <ul>
                    <li v-for="value in pair.long_data" :key="value.timestamp">{{ value.timestamp }} 得分: {{value.totalScore}}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h2>{{ $t('recommendedpairs.recommended_short_transaction_pair') }}</h2>
        <div v-if="recommendedPairs.short && recommendedPairs.short.length > 0" class="short-recommendations">
          <table class="pairs-table">
            <thead>
              <tr>
                <th>{{ $t('recommendedpairs.transaction') }}</th>
                <th>{{ $t('recommendedpairs.timestamp') }}</th>
                <th>{{ $t('recommendedpairs.profit__specific') }}</th>
                <th>{{ $t('recommendedpairs.recommend') }}</th>
                <th>{{ $t('recommendedpairs.total_score') }}</th>
                <th>{{ $t('recommendedpairs.fifteen_minutes_data') }}</th>
                <th>{{ $t('recommendedpairs.long_cycle_data') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pair in recommendedPairs.short" :key="pair.inst_id">
                <td>{{ pair.inst_id }}</td>
                <td>{{ new Date(pair.latest_timestamp).toLocaleString('zh-CN', { hour12: false }) }}</td>
                <td>{{ pair.profit_rate }}</td>
                <!-- <td>{{ pair.data_15m.recommendation }}</td> -->
                <td>{{ $t('recommendedpairs.short') }}</td>
                <td>{{ pair.latest_data_15m.score }}</td>
                <td>
                  <ul>
                    <li v-for="(value, key) in pair.latest_data_15m" :key="key">{{ key }}: {{ formatValue(value) }}</li>
                  </ul>
                </td>
                <td>
                  <ul>
                    <li v-for="value in pair.long_data" :key="value.timestamp">{{ value.timestamp }} 得分: {{value.totalScore}}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="score-explanation">
      得分范围：-10 到 +10。正数表示做多信号强度，负数表示做空信号强度。绝对值越大，信号越强。
    </div>

  </div>
</template>

  
  <script>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  export default {
    name: 'RecommendedPairs',
    setup() {
      const recommendedPairs = ref([])
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
      
      const formatValue = (value) => {
        if (typeof value === 'number') {
          return value.toFixed(4); // 数字保留最多 4 位小数
        }
        return value; // 非数字直接返回
      }

      const fetchRecommendedPairs = async () => {
        try {
          const response = await axios.post('/serverApi/crypto/long_short_recommendations');
          console.log("Fetched data:", response.data); // 打印数据检查
          if (response.data && (response.data.long || response.data.short)) {
              recommendedPairs.value = response.data; // 确保有数据时才更新
          } else {
              console.warn('No data returned, keeping previous values.');
          }
          currentTime.value = new Date().toLocaleString('zh-CN', { hour12: false });
        } catch (error) {
          console.error('Error fetching recommended pairs:', error);
        }
      }
  
      onMounted(() => {
          fetchSummary();
          fetchRecommendedPairs(); // 初始加载
          setInterval(() => {
            fetchSummary();
            fetchRecommendedPairs(); // 每分钟刷新
          }, 60000);
      });

      return {
        recommendedPairs,
        currentTime,
        summary,
        formatValue
      }
    }
  }
  </script>
  
  <style scoped>
  .recommended-pairs {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
  }
  
  .recommended-pair {
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 15px;
      padding: 20px;
      text-align: center;
      width: 200px;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
  }
  
  .recommended-pair:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .recommended-pair h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
  }
  
  .recommended-pair .score {
      font-size: 28px;
      font-weight: 700;
      color: var(--accent-color);
      margin-bottom: 15px;
  }
  
  .recommended-pair .direction {
      font-size: 16px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 10px;
  }
  
  .recommended-pair .direction.long {
      background-color: rgba(52, 199, 89, 0.1);
      color: var(--long-color);
  }
  
  .recommended-pair .direction.short {
      background-color: rgba(255, 59, 48, 0.1);
      color: var(--short-color);
  }
  
  .recommended-pair .holding-time,
  .recommended-pair .signal-strength,
  .recommended-pair .adx,
  .recommended-pair .volatility {
      font-size: 14px;
      margin-top: 5px;
  }
  
  .score-explanation {
      text-align: center;
      margin-top: 25px;
      font-style: italic;
      color: var(--neutral-color);
      font-size: 14px;
  }
  
  .no-recommendations {
      text-align: center;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 15px;
      backdrop-filter: blur(5px);
  }
  
  .no-recommendations p {
      margin: 5px 0;
      color: var(--text-color);
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


.marker-table-wrapper {
  margin-top: 20px;
}

.marker-table {
  width: 100%;
  border-collapse: collapse;
}

.marker-table th,
.marker-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.marker-table th {
  background-color: #f4f4f4;
}

.marker-table td {
  font-size: 16px;
}

.pairs-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.pairs-table th,
.pairs-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.pairs-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.pairs-table td ul {
  list-style-type: none;
  padding: 0;
}


  </style>