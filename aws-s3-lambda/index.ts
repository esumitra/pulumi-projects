import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as conf from "./config"
import { lambdaFunctionFromLocalFile, lambdaFunctionFromS3File } from "./utils"


function createLambda(lambdaConf: conf.LambdaConfig): aws.lambda.Function | null {
  switch(lambdaConf.lambdaPackage.type) {
    case conf.LambdaSourceTypes.s3Source:
      console.log('creating lambda from package uploaded to S3')
      return lambdaFunctionFromS3File(
        lambdaConf.name,
        lambdaConf.lambdaPackage.s3ZipFile.localZipFile,
        lambdaConf.handler,
        lambdaConf.runtime,
        lambdaConf.timeout,
        lambdaConf.logGroup,
        lambdaConf.lambdaPackage.s3ZipFile.bucketName,
        lambdaConf.lambdaPackage.s3ZipFile.path
      );
    case conf.LambdaSourceTypes.localSource:
      console.log('creating lambda from local file package');
      return lambdaFunctionFromLocalFile(
        lambdaConf.name, 
        lambdaConf.lambdaPackage.localZipFile,
        lambdaConf.handler,
        lambdaConf.runtime,
        lambdaConf.timeout,
        lambdaConf.logGroup
      );
    default:
      throw new Error('unknown package type');
  }
}

const lambdaFn = createLambda(conf.lambdaConfig);


