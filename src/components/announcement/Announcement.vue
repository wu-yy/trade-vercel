<template>
  <div class="crypto-announcements-page">
    <!-- Data source selector -->
    <div class="mb-6 flex justify-center items-center space-x-4">
      <button
        v-for="source in ['binance', 'okx']"
        :key="source"
        @click="selectedSource = source; fetchAnnouncements()"
        class="px-4 py-2 rounded-full transition-all duration-200"
        :class="selectedSource === source 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ source.charAt(0).toUpperCase() + source.slice(1) }}
      </button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center my-4">
      <p>Loading announcements...</p>
    </div>

    <!-- Announcements display -->
    <div v-else class="announcements-container flex flex-wrap justify-center mx-auto">
      <div
        v-for="(category, categoryName) in categorizedAnnouncements"
        :key="categoryName"
        class="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 px-4 mb-6"
      >
        <h2 class="text-xl font-semibold mb-4 text-center">{{ $t(`announcements.${categoryName}`) }}</h2>
        <div class="category-column space-y-8">
          <div
            v-for="announcement in category"
            :key="announcement._id"
            class="announcement-card bg-white shadow rounded p-4"
          >
            <p class="text-sm text-gray-600">{{ formatDate(announcement.releaseDate) }}</p>
            <h3 class="font-medium my-2" v-html="highlightTitle(announcement.title)"></h3>
            <span
              class="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded"
            >
              {{ $t(`announcements.${announcement.source}`) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  
  const announcements = ref([]);
  const selectedSource = ref('binance');
  const loading = ref(false);
  
  const fetchAnnouncements = async () => {
    loading.value = true;
    try {
      let url = selectedSource.value === 'binance' 
        ? '/serverApi/crypto/get_binance_announcements'
        : '/serverApi/crypto/get_okx_announcements'; // Assuming this endpoint exists
      const response = await fetch(url);
      const data = await response.json();
      announcements.value = data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      loading.value = false;
    }
  };
  
  const categorizedAnnouncements = computed(() => {
    const categories = {};
    announcements.value.forEach(announcement => {
      if (!categories[announcement.catalogName]) {
        categories[announcement.catalogName] = [];
      }
      categories[announcement.catalogName].push(announcement);
    });
    return categories;
  });
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  const highlightTitle = (title) => {
    return title.replace(/[A-Z0-9-a-z]+/g, match => `<span class="text-blue-600 font-semibold">${match}</span>`);
  };
  
  onMounted(fetchAnnouncements);
  </script>
  
  <style scoped>
  .crypto-announcements-page {
    max-width: 80%;
    margin: 0 auto;
    padding: 100px 0 30px 0;
    text-align: center;
  }
  
  .announcements-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin: 0 auto;
  }
  
  .category-column {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .announcement-card {
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  text-align: left; /* 设置卡片内文字居左对齐 */
}

  .announcement-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .buttons {
    margin-bottom: 20px;
  }
  
  .buttons button {
    text-transform: capitalize;
  }
  
  h2 {
    text-align: center;
  }
  </style>
  
  