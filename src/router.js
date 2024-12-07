import { createRouter, createWebHistory } from 'vue-router'
import LongRecomm from './components/LongRecomm.vue'
import MarketIndicators from './components/MarketIndicators.vue'
import AllIndicators from './components/AllIndicators.vue'
import MarketAll from './components/MarketAll.vue'
import InstSearch from './components/InstSearch.vue'
import InstIdInfo from './components/InstId/InstIdInfo.vue'
import Register from './views/register/registerIndex.vue'
import Login from './views/login/loginIndex.vue'
import Twitter from './components/Twitter.vue'

import { trackPageview } from "@/utils/UmUtils";
import Announcement from './components/announcement/Announcement.vue'
import PaymentResult from './components/PaymentResult.vue'
import MembershipPage from './components/MembershipPage.vue'

const constantRoutes = [
  {
    path: '/',
    name: 'LongRecomm',
    component: LongRecomm
  },
  {
    path: '/market_indicators',
    name: 'MarketIndicators',
    component: MarketIndicators
  },
  {
    path: '/all_indicators',
    name: 'AllIndicators',
    component: AllIndicators
  },
  {
    path: '/market_all',
    name: 'MarketAll',
    component: MarketAll
  },
  {
    path: '/inst_search',
    name: 'InstSearch',
    component: InstSearch
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/twitter',
    name: 'Twitter',
    component: Twitter
  },
  {
    path: '/announcement',
    name: '交易所公告',
    component: Announcement
  },
  {
    path: '/payment_result',
    name: 'PaymentResult',
    component: PaymentResult
  },
  {
    path: '/membership',
    name: 'Membership',
    component: MembershipPage
  }
]

export const routes = [...constantRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
	trackPageview(to.path);
	next();
});

router.afterEach((to) => {
	// 一定要再afterEach中判断而不是beforeEach，因为beforeEach在点击返回之后获取到的值不准确，每返回一次，会获取到延后一次的to、history
	if (window.history.state && window.history.state.forward) {
		// 或者判断 to.forward,window.history.state.forward是vue-router写入的，当返回或前进的时候才会有值
		to.meta.isBack = true;
	} else {
		to.meta.isBack = false;
	}
});

export default router
