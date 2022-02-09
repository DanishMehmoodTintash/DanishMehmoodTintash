/* eslint-disable import/no-mutable-exports */
const environment = process.env.REACT_APP_BUILD_ENV || "development";

let config;

switch (environment) {
  case "development":
    config = {
      baseUrl: "https://www.legacy.decorist.com",
      s3BucketUrl: "https://3d-shopping.s3.amazonaws.com/dorm-mvp-dev",
      mixpanelToken: "175634cdc493fa2fac44bea33bc2fd0f",
      env: process.env.NODE_ENV,
      mode: process.env.MODE,
    };
    break;
  case "staging":
    config = {
      baseUrl: "https://www.legacy.decorist.com",
      s3BucketUrl: "https://3d-shopping.s3.amazonaws.com/dorm-mvp-dev",
      mixpanelToken: "175634cdc493fa2fac44bea33bc2fd0f",
      env: process.env.NODE_ENV,
      mode: process.env.MODE,
    };
    break;
  case "production":
    config = {
      baseUrl: "https://www.decorist.com",
      s3BucketUrl: "https://3d-shopping.s3.amazonaws.com/shop-by-room-prod",
      mixpanelToken: "a2e6f2c4eeedeab5f2927da421990047",
      env: process.env.NODE_ENV,
      mode: process.env.MODE,
    };
    break;
  // no default
}

export default config;
