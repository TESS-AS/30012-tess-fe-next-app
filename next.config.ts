import { NextConfig } from "next";

const nextConfig: NextConfig = {
	// i18n: {
	// 	locales: ["en", "no"],
	// 	defaultLocale: "en",
	// },
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "media.bluestonepim.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
