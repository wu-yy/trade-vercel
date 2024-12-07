/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		container: {
			center: true,
			screens: {},
		},
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"3xl": "1920px",
		},
		fontFamily: {
			pangmenzhengdao: "pangmenzhengdao",
		},
		extend: {
			colors: {
				agray: "#F1F1F4",
				apurple: "#A700FF",
				a333: "#333333",
				a666: "#666666",
			},
			width: {
				4.5: "1.125rem",
				8.5: "2.125rem",
				15: "3.75rem",
				17: "4.25rem",
				17.5: "4.375rem",
				25: "6.25rem",
				26: "6.5rem",
				30: "7.5rem",
				76: "19rem",
				85: "21.25rem",
				100: "25rem",
				120: "30rem",
				160: "40rem",
				200: "50rem",
			},
			height: {
				4.5: "1.125rem",
				7.5: "1.875rem",
				8.5: "2.125rem",
				12.5: "3.125rem",
				15: "3.75rem",
				17: "4.25rem",
				18: "4.5rem",
				25: "6.25rem",
				88: "22rem",
				108: "27rem",
				192: "48rem",
			},
			padding: {
				7.5: "1.875rem",
				15: "3.75rem",
				22.5: "5.625rem",
				"1/4": "25%",
			},
			margin: {
				7.5: "1.875rem",
				15: "3.75rem",
			},
			borderRadius: {
				"1/1": "100%",
			},
			gap: {
				25: "6.25rem",
			},
			fontSize: {
				10: "0.625rem",
				30: "1.875rem",
			},
			translate: {
				"3/8": "37.5%",
			},
		},
	},
	corePlugins: {
		preflight: true, // 确保启用浏览器样式重置
	},
	plugins: [
		require("@tailwindcss/typography"),
		function ({ addComponents }) {
			addComponents({
				".container": {
					"@screen md": {
						maxWidth: "768px",
					},
					"@screen lg": {
						maxWidth: "1000px",
					},
					"@screen xl": {
						maxWidth: "1200px",
					},
					"@screen 3xl": {
						maxWidth: "1500px",
					},
				},
			});
		},
	],
};
