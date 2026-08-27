import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

import {SiteConfig, siteConfig} from "./config"

// Detect MIME content type from file extension.
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".txt": "text/plain",
    ".xml": "application/xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  return mimeTypes[ext] ?? "application/octet-stream";
}

// Create an S3 bucket. Website hosting is configured via a separate resource.
function createWebsiteBucket(bucketName: string): aws.s3.Bucket {
  return new aws.s3.Bucket(bucketName, {});
}

// Configure static website hosting for the bucket.
// Replaces the deprecated `website` inline property on aws.s3.Bucket.
function configureBucketWebsite(
  bucket: aws.s3.Bucket,
  indexDoc: string,
): aws.s3.BucketWebsiteConfiguration {
  return new aws.s3.BucketWebsiteConfiguration("bucketWebsiteConfig", {
    bucket: bucket.id,
    indexDocument: {
      suffix: indexDoc,
    },
  });
}

// Allow public access for bucket (required before attaching a public bucket policy).
function bucketAccessBlock(bucket: aws.s3.Bucket): aws.s3.BucketPublicAccessBlock {
  return new aws.s3.BucketPublicAccessBlock("bucketPublicAccessBlock", {
    bucket: bucket.id,
    blockPublicPolicy: false,
    restrictPublicBuckets: false,
  });
}

// Create an S3 Bucket Policy to allow public read of all objects in bucket.
function bucketPolicy(
  siteBucket: aws.s3.Bucket,
  accessBlock: aws.s3.BucketPublicAccessBlock,
): aws.s3.BucketPolicy {
  return new aws.s3.BucketPolicy("siteBucketPolicy", {
    bucket: siteBucket.bucket,
    policy: {
      Version: "2012-10-17",
      Statement: [{
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [
          pulumi.interpolate`${siteBucket.arn}/*`,
        ],
      }],
    },
  }, { dependsOn: [accessBlock] }); // ensure the access block is applied first
};

// Copy all files and folders recursively to an S3 bucket.
// Uses BucketObjectv2 and detects content type per file extension.
function copyFolderToS3Website(srcFolder: string, bucket: aws.s3.Bucket, prefix: string = ""): void {
  for (const file of fs.readdirSync(srcFolder)) {
    const fullPath = `${srcFolder}/${file}`;
    const targetFile = `${prefix}${file}`;
    if (fs.lstatSync(fullPath).isDirectory()) {
      copyFolderToS3Website(fullPath, bucket, `${targetFile}/`);
    } else {
      new aws.s3.BucketObjectv2(targetFile, {
        bucket: bucket.id,
        key: targetFile,
        contentType: getContentType(file),
        source: new pulumi.asset.FileAsset(fullPath),
      });
    }
  }
}

// Create website from S3 bucket and copy all local files to bucket.
function createWebsite(siteConfig: SiteConfig): pulumi.Output<string>[] {
  const siteBucket: aws.s3.Bucket = createWebsiteBucket(siteConfig.bucketName);
  const accessBlock = bucketAccessBlock(siteBucket);
  const websiteConfig = configureBucketWebsite(siteBucket, siteConfig.indexDocument);
  bucketPolicy(siteBucket, accessBlock);
  copyFolderToS3Website(siteConfig.srcFolder, siteBucket);
  return [siteBucket.id, pulumi.interpolate`http://${websiteConfig.websiteEndpoint}`];
}

// Export the name of the bucket and the website URL.
export const [bucketName, bucketEndpoint] = createWebsite(siteConfig);
