import axios from "axios";
import { ElMessage } from "element-plus";
import { clearSession } from "@/utils/tools";
import { store } from "@/store";
import { useUserStore } from "@/store";
const userStore = useUserStore(store);

const Http = axios.create({
	baseURL: "/serverApi",
	timeout: 3600 * 1000,
	// withCredentials: true,
});

Http.interceptors.request.use((config) => {
	// return config;
	const token = localStorage.getItem('neverendsart_authToken'); // 从 localStorage 获取 token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 设置 Authorization 头
        }
	return config;
},
(error) => {
	return Promise.reject(error);
}
);

Http.interceptors.response.use(
	(response) => {
		const data = response.data;
		if (data.errNo === 0) {
			return data;
		} else if (data.errNo === 3) {
			ElMessage.error(data.errMsg);
			clearSession();
			userStore.setIsLogin(true);
			return Promise.reject(data);
		} else {
			ElMessage.error(data.errMsg);
			return Promise.reject(data);
		}
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default Http;
