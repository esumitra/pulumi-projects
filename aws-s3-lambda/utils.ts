import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as conf from "./config"

export function createS3Bucket (bucketName: string): aws.s3.Bucket {
  const bucket = new aws.s3.Bucket(bucketName);
  return bucket;
};

export function copyFileToS3(
  filePath: string,
  s3Bucket: string,
  s3Key: string
): [aws.s3.Bucket, aws.s3.BucketObject] {
  const bucket = createS3Bucket(s3Bucket);
  const obj = new aws.s3.BucketObject(s3Key, {
    bucket: bucket,
    source: filePath
  });
  
  return [bucket, obj];
}

const iamForLambda = new aws.iam.Role("iamForLambda", {assumeRolePolicy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
`});

function lambdaLogReources(groupName: string) {
  const logGroup = new aws.cloudwatch.LogGroup(groupName, {
    retentionInDays: 14,
  });
  const lambdaLogging = new aws.iam.Policy(`lambdaLogging-${groupName}`, {
    path: "/",
    description: "IAM policy for logging from a lambda",
    policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
`,
  });
  const lambdaLogs = new aws.iam.RolePolicyAttachment("lambdaLogs", {
    role: iamForLambda.name,
    policyArn: lambdaLogging.arn,
  });
  return [logGroup, lambdaLogs];
}

export function lambdaFunctionFromLocalFile(
  name:string, 
  zipPath: string,
  handler: string,
  runtime: string,
  timeout: number,
  logGroupName: string,
  env_vars?: Map<string, string>): aws.lambda.Function {
  const [logGroup, lambdaLogs] = lambdaLogReources(logGroupName);
  return new aws.lambda.Function( name,
    {
      code: new pulumi.asset.FileArchive(zipPath),
      role: iamForLambda.arn,
      handler: handler,
      runtime: runtime,
      timeout: timeout
      // environment: {
      //   variables: env_vars
      // }
    }, {
      dependsOn: [
        lambdaLogs,
        logGroup,
    ]
    });
}

export function lambdaFunctionFromS3File(
  name:string, 
  zipPath: string,
  handler: string,
  runtime: string,
  timeout: number,
  logGroupName: string,
  s3Bucket: string,
  s3Key: string,
  env_vars?: Map<string, string>): aws.lambda.Function {
  const [logGroup, lambdaLogs] = lambdaLogReources(logGroupName);
  const [bucket, obj] = copyFileToS3(zipPath, s3Bucket, s3Key);
  console.log();
  const lambdaFn = new aws.lambda.Function( name,
    {
      s3Bucket: bucket.id,
      s3Key: obj.key,
      role: iamForLambda.arn,
      handler: handler,
      runtime: runtime,
      timeout: timeout
      // environment: {
      //   variables: env_vars
      // }
    }, {
      dependsOn: [
        lambdaLogs,
        logGroup,
    ]
    });
    return lambdaFn;
}
