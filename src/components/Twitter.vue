<template>
  <div class="twitter-container">
    <div class="left-panel bg-gray-100 dark:bg-gray-800">
      <h2 class="text-xl font-bold mb-6 text-gray-800">X Monitor</h2>
      <div class="mb-6" v-if="userStore.getUserId === 6708203963028">
        <h3 class="text-base font-semibold mb-3 text-gray-700">Configure Monitoring</h3>
        <label for="tweet-count" class="block text-sm font-medium text-gray-600 mb-1">Number of tweets to fetch:</label>
        <input v-model.number="settings.tweetCount" type="number" id="tweet-count" placeholder="Tweet count" class="w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <label for="refresh-interval" class="block text-sm font-medium text-gray-600 mt-4 mb-1">Refresh interval (seconds):</label>
        <input v-model.number="settings.refreshInterval" type="number" id="refresh-interval" placeholder="Refresh interval" class="w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <button @click="updateSettings" class="mt-4 w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out">
          Update Settings
        </button>
      </div>
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-3 text-gray-700">{{ $t('twitter.add_accounts_to_monitor') }}</h3>
        <input v-model="newAccount" placeholder="Account to monitor (without @)" class="w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2" />
        <select v-model="newAccountType" class="w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2">
          <option value="investment-advice">Investment Advice</option>
          <option value="market-analysis">Market Analysis</option>
          <option value="warning">{{ $t('twitter.warning') }}</option>
        </select>
        <button @click="handleAddAccount" class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">{{ $t('twitter.add_account') }}</button>
      </div>
      <div class="mb-6">
        <h3 class="text-base font-semibold mb-3 text-gray-700 dark:text-gray-700">{{ $t('twitter.monitored_accounts') }}</h3>
        <div class="account-dropdown">
          <select v-if="!isLoading" v-model="selectedAccount" class="w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">{{ $t('twitter.select_account') }}</option>
            <option v-for="account in accounts" :key="account.account" :value="account.account">
              {{ account.account }} ({{ account.account_type.replace('-', ' ') }})
            </option>
          </select>
          <p v-else-if="isLoading" class="text-gray-500">{{ $t('twitter.loading_accounts') }}</p>
          <p v-else-if="accounts.length === 0" class="text-gray-500">{{ $t('twitter.no_accounts_available') }}</p>
        </div>
        <button @click="confirmRemoveAccount" class="mt-2 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out" :disabled="!selectedAccount">
          {{ $t('twitter.remove_selected_account') }}
        </button>
      </div>
    </div>
    <div class="right-panel">
      <TweetColumn
        v-for="type in tweetTypes"
        :key="type"
        :title="type.replace('-', ' ')"
        :tweets="filteredTweets[type]"
      />
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h3 class="text-base font-semibold mb-4 text-gray-800 dark:text-white">{{ $t('twitter.confirm_account_removal') }}</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">{{ $t('twitter.are_you_sure_you_want_to_remove_the_account') }} "{{ selectedAccount }}"?</p>
        <div class="flex justify-end space-x-4">
          <button @click="cancelRemoveAccount" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out">{{ $t('twitter.becel') }}</button>
          <button @click="removeAccount" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out">
            {{ $t('twitter.confirm_remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import TweetColumn from "./TweetColumn.vue";
import { useUserStore } from '@/store'
import { getSession, clearSession, setSession} from '@/utils/tools'
import Http from '@/http/http.js';
import { useI18n } from 'vue-i18n'


export default {
  name: "Twitter",
  components: {
    TweetColumn,
  },
  setup() {
    const { t } = useI18n();  // 在setup中获取t函数
    const userStore = useUserStore()
    const settings = reactive({
      tweetCount: 0,
      refreshInterval: 0,
    });

    const accounts = ref([]);
    const tweets = ref([]);
    const newAccount = ref("");
    const newAccountType = ref("investment-advice");
    const selectedAccount = ref("");
    const isLoading = ref(false);
    const showConfirmModal = ref(false);

    const lang = getSession('lang')

    const isMember = computed(() => userStore.membershipLevelRank !== 0);

    const handleAddAccount = () => {
      if (isMember.value) {
        addAccount();
      } else {
        const lang = getSession('lang')
        alert(lang === 'en-us' ? 'Please purchase a membership' : '请购买会员后操作');
        // You can replace this with a more sophisticated UI for directing users to the membership page
      }
    };

    const tweetTypes = ["investment-advice", "market-analysis", "warning"];
    const filteredTweets = computed(() => {
      console.log("filteredTweets tweets.value", tweets.value);
      const groupedTweets = {
        "investment-advice": [],
        "market-analysis": [],
        "warning": [],
      };
      tweets.value.forEach((data) => {
        if (data.account_type && groupedTweets[data.account_type]) {
          groupedTweets[data.account_type].push(data);
        }
      });
      console.log("groupedTweets", groupedTweets);
      return groupedTweets;
    });

    const fetchAccounts = async () => {
      isLoading.value = true;
      try {
        const response = await axios.get("/serverApi/crypto/twitter_account");
        if (response.data) {
          accounts.value = response.data.data;
          console.log("Fetched accounts:", accounts.value);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
        alert("Failed to fetch accounts: " + (error.response?.data?.message || error.message || "Unknown error"));
      } finally {
        isLoading.value = false;
      }
    };

    const addAccount = async () => {
      try {
        const response = await axios.post("/serverApi/crypto/add_twitter_account", {
          account: newAccount.value.replace("@", ""),
          account_type: newAccountType.value,
        });
        if (response.data.success) {
          alert(response.data.message); // Success alert
          newAccount.value = "";
          await fetchAccounts(); // Refresh the accounts list
        } else {
          alert("Failed to add account: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to add account: " + (error.response?.data?.message || error.message || "Unknown error"));
      }
    };

    const confirmRemoveAccount = () => {
      if (selectedAccount.value) {
        showConfirmModal.value = true;
      }
    };

    const cancelRemoveAccount = () => {
      showConfirmModal.value = false;
    };

    const removeAccount = async () => {
      if (!isMember.value) {
        // alert("Please purchase a membership to remove monitored accounts.");
        alert(t('twitter.please_purchase_a_membership_to_remove_monitored_accounts'));
        showConfirmModal.value = false;
        return;
      }
      
      if (!selectedAccount.value) return;
      try {
        const response = await axios.post("/serverApi/crypto/remove_twitter_account", {
          account: selectedAccount.value,
        });
        if (response.data.success) {
          selectedAccount.value = "";
          await fetchAccounts(); // Refresh the accounts list
          alert("Account removed successfully");
        } else {
          alert("Failed to remove account: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to remove account: " + (error.response?.data?.message || error.message || "Unknown error"));
      } finally {
        showConfirmModal.value = false;
      }
    };

    const fetchTweets = async () => {
      console.log("fetchTweets begin....");
      const response = await Http.get("/crypto/get_tweets");
      console.log("response:", response.data.tweets);
      try {
        // const response = await axios.get("/serverApi/crypto/get_tweets");
        if (response.data) {
          tweets.value = response.data.tweets;
        } else {
          console.error("Error222222:", response);
        }
      } catch (error) {
        console.error("Error111111:", error);
      }
    };

    const updateSettings = async () => {
      try {
        const response = await axios.post("/serverApi/crypto/twitter_setting", {
          tweet_count: settings.tweetCount,
          refresh_interval: settings.refreshInterval,
        });
        if (response.data.success) {
          alert("Settings updated successfully");
          await fetchTweets(); // Refresh tweets with new settings
        } else {
          alert("Failed to update settings: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to update settings: " + (error.response?.data?.message || error.message || "Unknown error"));
      }
    };

    const fetchSettings = async () => {
      try {
        const response = await axios.get("/serverApi/crypto/get_twitter_setting");
        if (response.data) {
          settings.tweetCount = response.data.tweet_count;
          settings.refreshInterval = response.data.refresh_interval;
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };


    let intervalId;

    const startFetchInterval = () => {
      intervalId = setInterval(fetchTweets, 60000); // 60000 ms = 1 minute
    };

    const stopFetchInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    onMounted(async () => {
      await fetchSettings();
      await fetchAccounts();
      await fetchTweets();
      startFetchInterval();
    });

    onUnmounted(() => {
      stopFetchInterval();
    });


    return {
      settings,
      accounts,
      newAccount,
      newAccountType,
      selectedAccount,
      tweetTypes,
      filteredTweets,
      addAccount,
      removeAccount,
      isLoading,
      showConfirmModal,
      confirmRemoveAccount,
      cancelRemoveAccount,
      updateSettings,
      fetchSettings,
      startFetchInterval,
      stopFetchInterval,
      userStore,
      isMember,
      handleAddAccount,
    };
  },
};
</script>

<style scoped lang="less">
/* 导入全局样式 */
@import "@/assets/styles/twitter.css";
</style>

