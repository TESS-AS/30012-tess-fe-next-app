import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "media.bluestonepim.com",
				pathname: "/**",
			},
		],
	},
	env: {
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
