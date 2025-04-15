import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
      domains: ['media.bluestonepim.com'],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
