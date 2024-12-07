<template>
    <div :class="[
      'rounded-lg overflow-hidden',
      getBgClass(category.membershipLevel)
    ]">
      <!-- Header -->
      <div :class="[
        'p-4 flex items-center justify-center',
        getHeaderBgClass(category.membershipLevel)
      ]">
        <span class="text-lg font-bold">{{ category.membershipLevel }}</span>
      </div>
  
      <!-- Pricing Options -->
      <div class="p-6 bg-[#1F2023] space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="option in category.options" 
            :key="option.productId"
            @click="selectOption(option)"
            :class="[
              'relative bg-[#2A2B2F] rounded p-3 text-center cursor-pointer transition-all duration-200',
              selectedProductId === option.productId ? 'ring-2 ring-[#FFA940]' : ''
            ]"
          >
            <div v-if="getDiscount(option)" class="absolute -top-2 -right-2 bg-[#FFA940] text-xs px-2 py-1 rounded">
              {{ getDiscount(option) }}折
            </div>
            <div class="text-sm text-gray-400">{{ option.durationDays ? `${option.durationDays} ${$t('membershippage.day')}` : $t('membershippage.lifetime') }}</div>
            <div class="text-xl font-bold text-white mt-1">{{ option.price }}</div>
            <div class="text-xs text-gray-500">{{ $t('productitem.integral') }}</div>
          </div>
        </div>
  
        <!-- Subscribe Button -->
        <button 
          @click="purchase"
          :disabled="!hasSelectedOption"
          :class="[
            'w-full py-3 rounded text-center transition-colors duration-300',
            getButtonClass(category.membershipLevel),
            !hasSelectedOption ? 'opacity-50 cursor-not-allowed' : ''
          ]"
        >{{ $t('productitem.subscribe_now') }}</button>
  
        <!-- Features List -->
        <div class="space-y-3 mt-6">
          <div v-for="(feature, index) in getFeatures(category.membershipLevelRank)" :key="index"
            class="flex items-start space-x-2 text-sm">
            <span :class="[
              'mt-1',
              feature.available ? 'text-green-500' : 'text-red-500'
            ]">
              {{ feature.available ? '✓' : '✗' }}
            </span>
            <span :class="[
              'text-gray-400',
              feature.available ? '' : 'line-through'
            ]">{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, defineProps, defineEmits } from 'vue';
  import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const { t } = useI18n();  // 在setup中获取t函数


  const props = defineProps({
    category: {
      type: Object,
      required: true
    },
    selectedProductId: {
      type: Number,
      default: null
    }
  });
  
  const emit = defineEmits(['select', 'purchase']);
  
  const hasSelectedOption = computed(() => {
    return props.category.options.some(option => option.productId === props.selectedProductId);
  });
  
  const features = [
    { text: t(`membershippage.feature1`), availableFrom: 1 },
    { text: t(`membershippage.feature2`), availableFrom: 1 },
    { text: t(`membershippage.feature3`), availableFrom: 1 },
    { text: t(`membershippage.feature4`), availableFrom: 1 },
    { text: t(`membershippage.feature5`), availableFrom: 2 },
    { text: t(`membershippage.feature6`), availableFrom: 2 },
    { text: t(`membershippage.feature7`), availableFrom: 3 },
    { text: t(`membershippage.feature8`), availableFrom: 3 },
    { text: t(`membershippage.feature9`), availableFrom: 4 }
  ];
  
  const getFeatures = (rank) => {
    return features.map(feature => ({
      ...feature,
      available: feature.availableFrom <= rank
    }));
  };
  
  const getDiscount = (option) => {
    if (!option.durationDays) return null; // For lifetime membership
    const basePrice = option.price / option.durationDays * 90;
    const discount = (option.price / basePrice).toFixed(1);
    return discount < 1 ? discount : null;
  };
  
  const getBgClass = (level) => {
    const classes = {
      '初级会员': 'bg-gradient-to-b from-[#C0C0C0] to-[#E8E8E8]',
      '中级会员': 'bg-gradient-to-b from-[#B8C6E2] to-[#D6E0F5]',
      '高级会员': 'bg-gradient-to-b from-[#D4B572] to-[#E8D5A5]',
      '终生会员': 'bg-gradient-to-b from-[#7B68EE] to-[#9370DB]'
    };
    return classes[level] || classes['初级会员'];
  };
  
  const getHeaderBgClass = (level) => {
    const classes = {
      '初级会员': 'bg-[#1F2023] text-white',
      '中级会员': 'bg-[#1F2023] text-white',
      '高级会员': 'bg-[#1F2023] text-white',
      '终生会员': 'bg-[#1F2023] text-white'
    };
    return classes[level] || classes['初级会员'];
  };
  
  const getButtonClass = (level) => {
    const classes = {
      '初级会员': 'bg-[#C0C0C0] hover:bg-[#B0B0B0] text-white',
      '中级会员': 'bg-[#B8C6E2] hover:bg-[#A8B6D2] text-white',
      '高级会员': 'bg-[#D4B572] hover:bg-[#C4A562] text-white',
      '终生会员': 'bg-[#7B68EE] hover:bg-[#6B58DE] text-white'
    };
    return classes[level] || classes['初级会员'];
  };
  
  const selectOption = (option) => {
    emit('select', option.productId);
  };
  
  const purchase = () => {
    if (props.selectedProductId) {
      emit('purchase', props.selectedProductId);
    }
  };
  </script>
  
  <style scoped>
  @import '../assets/styles/account.css';
  </style>
  
  