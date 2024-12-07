import { defineStore } from "pinia";
import { getSession, setSession } from "@/utils/tools";

export const useUserStore = defineStore("user-store", {
	state: () => {
		return {
			isLogin: null,
			gallery: getSession("gallery") === "mine" ? "mine" : "explore",
			userId: getSession("userId"),
			membershipLevelRank: 0,
			remainingDays: 0,
		};
	},
	getters: {
		getIsLogin: (state) => {
			return state.isLogin;
		},
		getGallery: (state) => {
			console.log("获取gallery:", state.gallery)
			return state.gallery;
		},
		getUserId: (state) => {
			return state.userId
		},
		getMembershipLevelRank: (state) => {
			return state.membershipLevelRank
		},
		getRemainingDays: (state) => {
			return state.remainingDays
		}
	},
	actions: {
		setIsLogin(val) {
			this.isLogin = val;
		},
		setGallery(val) {
			console.log("设置gallery:", val)
			setSession("gallery", val);
			this.gallery = val;
		},
		setUserId(val) {
			setSession("userId", val)
			this.userId = val
		},
		setMembershipLevelRank(val) {
			this.membershipLevelRank = val
		},
		setRemainingDays(val) {
			this.remainingDays = val
		}
	},
});
