import Http from "@/http/http";

/**
 * 退出登录
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const logout = (data) => {
	return Http.post("/user/logout", data);
};

/**
 * 邮箱登录
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const loginEmail = (param) => {
	return Http.post("/user/login-email-code", param);
};


/**
 * 邮箱验证码登录
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const loginEmailCode = (param) => {
	return Http.post("/user/login-email-code", param);
};

/**
 * 邮箱注册
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const registerEmail = (param) => {
	return Http.post("/user/register-email", param);
};

/**
 * 注册邮箱验证码
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const sendEmailCode = (param) => {
	return Http.post("/user/send-emailcode", param);
};

/**
 * 获取用户唯一邀请码
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const genInviteCode = (param) => {
	return Http.post("/user/center/gen-invite-code", param);
};

/**
 * 付费商品列表
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const goodsList = () => {
	return Http.get("/user/pay/goods-list?app=nes");
};
