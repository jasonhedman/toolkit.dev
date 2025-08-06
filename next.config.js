import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns:
      process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http",
              hostname: "localhost",
              port: "6969",
            },
          ]
        : [
            {
              protocol: "https",
              hostname: "3kjwme0xuhfnyrkn.public.blob.vercel-storage.com",
            },
          ],
  },
  experimental: {
    authInterrupts: true,
  },
  serverExternalPackages: ["twitter-api-v2"],
};


export default config;
