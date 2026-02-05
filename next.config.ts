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
		// Avoid generating unnecessarily large images; improves cache hit and reduces work
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		// Cache optimized images longer so repeat views and other users get fast responses
		minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
