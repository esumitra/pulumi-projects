import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from "fs";

import {siteConfig} from "./config"

// Create an AWS resource (S3 Bucket)
function createWebsiteBucket(bucketName: string, indexDoc: string): aws.s3.Bucket {
  return new aws.s3.Bucket(bucketName, {
    website: {
      indexDocument: indexDoc
    }
  });
}

const bucket = createWebsiteBucket(siteConfig.bucketName, siteConfig.indexDocument);

function copyFolderToS3Website(srcFolder: string, bucket: aws.s3.Bucket, prefix: string = "") : void {
  for (const file of fs.readdirSync(srcFolder)) {
    const fullPath = `${srcFolder}/${file}`;
    const targetFile = `${prefix}${file}`;
    if (fs.lstatSync(fullPath).isDirectory()) {
      copyFolderToS3Website(fullPath, bucket, `${targetFile}/`);
    } else {
      console.log(`creating: (${fullPath}, ${targetFile})`)
      new aws.s3.BucketObject(targetFile, {
        acl: "public-read",
        contentType: "text/html",
        bucket: bucket,
        source: fullPath
      });
    }
  }
}

copyFolderToS3Website(siteConfig.srcFolder,bucket);

// Export the name of the bucket and URL
export const bucketName = bucket.id;
export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
