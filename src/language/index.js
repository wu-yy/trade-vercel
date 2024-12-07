import { createI18n } from "vue-i18n";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en_US";
import { getSession, setSession } from "@/utils/tools";

if (!getSession("lang")) {
	setSession("lang", "en-us");
}
const i18n = createI18n({
	legacy: false,
	locale: getSession("lang") ? getSession("lang") : "en-us", // 默认显示语言
	messages: {
		"zh-cn": zhCN,
		"en-us": enUS,
	},
});

export default i18n;
