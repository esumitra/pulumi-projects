import { Config } from "@pulumi/pulumi";
export enum LambdaSourceTypes {
  localSource = 'localSource',
  s3Source = 's3Source'
};

export type LocalSource = {
  type: LambdaSourceTypes.localSource,
  localZipFile: string
};

export type S3Source = {
  type: LambdaSourceTypes.s3Source,
  s3ZipFile: {
    bucketName: string,
    path: string,
    localZipFile: string
  }
};

export type LambdaConfig = {
  name: string,
  runtime: string,
  handler: string,
  timeout: number,
  logGroup: string,
  lambdaPackage: LocalSource | S3Source
};

const lambdaConfigKey: string = "lambdaConfig";

const config = new Config();

export const lambdaConfig: LambdaConfig = config.requireObject<LambdaConfig>(lambdaConfigKey);
