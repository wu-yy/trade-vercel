<template>
  <!-- <div class="container"> -->
    <Header />
    <router-view v-if="isRouterAlive"></router-view>
    <div id="loadingOverlay" v-show="loading">
      <div class="spinner"></div>
    </div>
    <div id="message" :class="messageClass">{{ message }}</div>
  <!-- </div> -->
</template>

<script setup>

import Header from './components/Header.vue'
import { ref, provide, nextTick } from 'vue';
import { useUserStore } from '@/store'

const isRouterAlive = ref(true);
const userStore = useUserStore()

// ERROR ResizeObserver loop completed with undelivered notifications.
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);

    }, delay);
  }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback);
  }
}

userStore.setIsLogin(!!localStorage.getItem('neverendsart_authToken'))
provide("reload", () => {
  isRouterAlive.value = false;
  nextTick(() => {
    isRouterAlive.value = true;
  })
});

</script>

<style>
@import './assets/styles/main.css';

/* Add your CSS from previous code */
</style>
