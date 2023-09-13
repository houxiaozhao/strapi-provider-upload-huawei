strapi 的插件，用于上传文件到华为 OBS，更改自`strapi-provider-upload-minio-ce`

# How to use

## Installation

`npm i --save strapi-provider-upload-huawei`

## Config

```js
// file: ./config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-huawei",
      providerOptions: {
        accessKey: env("OBS_ACCESS_KEY", "xxx"),
        secretKey: env("OBS_SECRET_KEY", "xxx"),
        bucket: env("OBS_BUCKET", "xxx"),
        endPoint: env("OBS_ENDPOINT", "obs.cn-north-4.myhuaweicloud.com"),
        folder: env("OBS_FOLDER", "xxx"),
        private: env("OBS_PRIVATE", false), // private bucket
        expiry: env("OBS_EXPIRY", 7 * 24 * 60 * 60), // default 7 days, unit: seconds, only work for private bucket
        acl: env("OBS_ACL", "public-read"),
      },
    },
  },
});
```

## Pictures cannot be displayed?

Mostly because of CSP, you can refer to [https://github.com/strapi/strapi/issues/12886](https://github.com/strapi/strapi/issues/12886)

If the image you uploaded is not displayed properly, you need to modify `./config/middlewares.js` as follows.

```js
// ./config/middlewares.js
export default [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": ["'self'", "data:", "blob:", "market-assets.strapi.io", "{bucket}.obs.cn-north-4.myhuaweicloud.com"],
          "media-src": ["'self'", "data:", "blob:", "market-assets.strapi.io", "{bucket}.obs.cn-north-4.myhuaweicloud.com"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
```
