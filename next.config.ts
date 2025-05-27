import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
	output: "standalone",
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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
