import Http from "../http";

/**
 * 用户信息
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export const loginInfo = (params) => {
	return Http.get("/crypto/login-info", { params: params });
};


