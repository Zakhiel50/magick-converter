import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: false,
});

export default withSerwist({
  // @ts-ignore
  turbopack: {},
  webpack: (config) => {
    return config;
  },
});
