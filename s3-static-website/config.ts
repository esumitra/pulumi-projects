import { Config } from "@pulumi/pulumi";

export type SiteConfig = {
  bucketName: string,
  srcFolder: string,
  indexDocument: string
};

const siteConfigKey: string = "siteConfig";

const config = new Config();

export const siteConfig: SiteConfig = config.requireObject<SiteConfig>(siteConfigKey);

// sample configuration object
// export const siteConfig: SiteConfig = {
//   bucketName: "static-website-1",
//   srcFolder: "./dist",
//   indexDocument: "index.html"
// }
