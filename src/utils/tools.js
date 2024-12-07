// 用户登录后，获取 Token 并存储到 localStorage
export function setSession(name, token) {
    console.log("设置 Token:", token);
    // localStorage.setItem('authToken', token); // 存储 Token 到 localStorage
	localStorage.setItem("neverendsart_" + name, token);
}

export function getSession(name) {
	// authToken
    const token = localStorage.getItem("neverendsart_" + name); // 从 localStorage 获取 Token
    console.log("获取 Token:", token);
    return token;
}

export function clearSession() {
    localStorage.removeItem("neverendsart_" + 'authToken'); // 清除 Token
}

export function getSystem() {
	let system = navigator.userAgent;
	let isAndroid = system.indexOf("Android") > -1 || system.indexOf("Adr") > -1; // android终端
	// let isiOS = !!system.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

	return isAndroid ? "Android" : "Ios";
}

// export const getUID = () => { // 获取唯一值
//     return 'xxxx-xxxx-xxxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
//         const r = Math.random() * 16 | 0;
//         var v = c === 'x' ? r : (r & 0x3 | 0x8)
//         return v.toString(16)
//     })
// }

/**
 * 随机字符串16位
 */
export const getUID = () => {
	let chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	let strs = "";
	for (let i = 0; i < 16; i++) {
		let id = parseInt(Math.random() * 10);
		strs += chars[id];
	}
	return strs;
};

/**
 * 判断是否为移动端
 */
export function currentMedia() {
	let media = "";
	const sUserAgent = navigator.userAgent.toLowerCase();
	const bIsIpad = sUserAgent.match(/ipad/i) == "ipad"; //判断是否为iPad
	const bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os"; //判断是否为iPhone用户
	const bIsMidp = sUserAgent.match(/midp/i) == "midp";
	const bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	const bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
	const bIsAndroid = sUserAgent.match(/android/i) == "android";
	const bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
	const bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

	if (
		!(
			bIsIpad ||
			bIsIphoneOs ||
			bIsMidp ||
			bIsUc7 ||
			bIsUc ||
			bIsAndroid ||
			bIsCE ||
			bIsWM
		)
	) {
		media = "PC";
	} else {
		media = "MP";
	}
	return media;
}

export function copyToClip(text) {
	return new Promise((resolve, reject) => {
		try {
			const input = document.createElement("textarea");
			0;
			input.setAttribute("readonly", "readonly");
			input.value = text;
			document.body.appendChild(input);
			input.select();
			const successful = document.execCommand("copy");
			document.body.removeChild(input);
			if (successful) {
				resolve(text);
			} else {
				reject(new Error("Unable to copy to clipboard."));
			}
		} catch (error) {
			reject(error);
		}
	});
}

export const throttle = (func, delay) => {
	let timerId;
	let lastExecTime = 0;

	return function (...args) {
		const currentTimestamp = Date.now();
		const elapsed = currentTimestamp - lastExecTime;

		clearTimeout(timerId);

		if (elapsed > delay) {
			func.apply(this, args);
			lastExecTime = currentTimestamp;
		} else {
			timerId = setTimeout(() => {
				func.apply(this, args);
				lastExecTime = Date.now();
			}, delay - elapsed);
		}
	};
};

export const getLastDom = (dom) => {
	const children = dom.childNodes;
	for (let i = children.length - 1; i >= 0; i--) {
		const node = children[i];
		if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.nodeValue)) {
			node.nodeValue = node.nodeValue.replace(/\s+$/, "");
			return node;
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const last = getLastDom(node);
			if (last) {
				return last;
			}
		}
	}
	return null;
};

export function formatMinutes(minutes) {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = parseInt(minutes % 60);
	// 使用padStart函数确保小时和分钟始终是两位数
	const formattedHours = hours.toString().padStart(2, "0");
	const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
	return formattedHours + ":" + formattedMinutes;
}
