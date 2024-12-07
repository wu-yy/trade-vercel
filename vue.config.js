const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
const path = require("path");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

function resolve(dir) {
	return path.join(__dirname, dir);
}

module.exports = defineConfig({
  transpileDependencies: true,
	productionSourceMap: false,
	outputDir: process.env.outputDir,
	configureWebpack: (config) => {
		const plugins = [];
		plugins.push(
			new CompressionWebpackPlugin({
				algorithm: "gzip",
				test: /\.js$|\.css$/,
				threshold: 10240,
			})
		);
		config.plugins = [...config.plugins, ...plugins];
	},
	chainWebpack: (config) => {
		config.plugin("html").tap((args) => {
			args[0].title = "Crypto Monitor";
			return args;
		});
    // 路径别名
    config.resolve.alias
    .set('@', resolve('src')) // 确保 `@` 指向 `src`
    .set('@http', resolve('src/http')); // 添加 `@http` 指向 `src/http`

		//最小化代码
		config.optimization.minimize(true);
		//分割代码
		config.optimization.splitChunks({
			chunks: "all",
		});
		//默认开启prefetch(预先加载模块)，提前获取用户未来可能会访问的内容 在首屏会把这十几个路由文件，都一口气下载了 所以我们要关闭这个功能模块
		config.plugins.delete("prefetch");
		config.module.rules.delete("svg"); // 重点:删除默认配置中处理svg
		config.module
			.rule("svg-sprite-loader") // rule 匹配规则
			.test(/\.svg$/) // 用正则匹配 文件
			.include // 包含
			.add(resolve("src/icons")) // 处理svg目录
			.end()
			// eslint-disable-next-line no-irregular-whitespace
			.use("svg-sprite-loader") //配置loader  use() 使用哪个loader
			.loader("svg-sprite-loader") // 加载loader
			.options({
				symbolId: "icon-[name]", // 将所有的.svg 集成到 symbol中，当使用 类名 icon-文件名
			});
	},

  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:23000', // 本地后端服务地址
        changeOrigin: true, // 允许跨域
        // pathRewrite: { '^/api': '' }, // 可选：移除 `/api` 前缀
      },
      '/serverApi': {
        target: 'http://localhost:23000', // 本地后端服务地址
        changeOrigin: true, // 允许跨域
        // pathRewrite: { '^/api': '' }, // 可选：移除 `/api` 前缀
      },
    },
	port: process.env.PORT || 8080, // 允许命令行参数覆盖
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'], // 指定需要监视的文件
      options: {
        ignoreInitial: true, // 忽略初始的文件变动
      },
    },
  },
});
