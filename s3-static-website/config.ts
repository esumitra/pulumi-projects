export type SiteConfig = {
  bucketName: string,
  srcFile: string,
  srcFolder: string,
  indexDocument: string
};

export const siteConfig: SiteConfig = {
  bucketName: "static-website-1",
  srcFile: "./dist/index.html",
  srcFolder: "./dist",
  indexDocument: "index.html"
}
