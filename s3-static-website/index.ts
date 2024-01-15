import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from "fs";

import {SiteConfig, siteConfig} from "./config"

// Create an AWS resource (S3 Bucket)
function createWebsiteBucket(bucketName: string, indexDoc: string): aws.s3.Bucket {
  return new aws.s3.Bucket(bucketName, {
    website: {
      indexDocument: indexDoc
    }
  });
}

// allow public access for bucket
function bucketAccessBlock(bucket: aws.s3.Bucket): aws.s3.BucketPublicAccessBlock {
  return new aws.s3.BucketPublicAccessBlock("bucketPublicAccessBlock", {
    bucket: bucket.id, // the name of the S3 bucket
    blockPublicPolicy: false,
    restrictPublicBuckets: false
  });
}

// Create an S3 Bucket Policy to allow public read of all objects in bucket
function bucketPolicy(siteBucket: aws.s3.Bucket): aws.s3.BucketPolicy {
  return new aws.s3.BucketPolicy("siteBucketPolicy", {
    bucket: siteBucket.bucket, // reference to the bucket created above
    policy: {
        Version: "2012-10-17",
        Statement: [{
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [
                pulumi.interpolate`${siteBucket.arn}/*` // grant read access to all objects
            ]
        }]
    },
  })
};

// copy all files and folders recursively to s3 bucket
function copyFolderToS3Website(srcFolder: string, bucket: aws.s3.Bucket, prefix: string = "") : void {
  for (const file of fs.readdirSync(srcFolder)) {
    const fullPath = `${srcFolder}/${file}`;
    const targetFile = `${prefix}${file}`;
    if (fs.lstatSync(fullPath).isDirectory()) {
      copyFolderToS3Website(fullPath, bucket, `${targetFile}/`);
    } else {
      new aws.s3.BucketObject(targetFile, {
        contentType: "text/html",
        bucket: bucket,
        source: fullPath
      });
    }
  }
}

// create website from S3 bucket and copy all local files to bucket
function createWebsite(siteConfig: SiteConfig): pulumi.Output<string>[] {
  const siteBucket:aws.s3.Bucket = createWebsiteBucket(siteConfig.bucketName, siteConfig.indexDocument);
  bucketAccessBlock(siteBucket);
  bucketPolicy(siteBucket);
  copyFolderToS3Website(siteConfig.srcFolder,siteBucket);
  return [siteBucket.id, pulumi.interpolate`http://${siteBucket.websiteEndpoint}`];
}

// Export the name of the bucket and URL
export const [bucketName, bucketEndpoint] = createWebsite(siteConfig);
