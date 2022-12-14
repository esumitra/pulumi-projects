# Pulumi Projects
The projects explore Infrastructure As Code using the Pulumi framework.

## Why care? 
As outlined in the short  book Accelerate, continuous delivery practices improve business results, cause less stress to software engineers, and result in better quality products. Individual teams are btter equipped to manage infrastructure and changes than a centralized CAB. Empowering teams to manage their own infrastructure requires bridging the gap between developer tools and languages and infrastructure management tools. Frameworks like Pulumi and AWS CDK allow us to bridge this gap and make teams more self sufficient in supporting their services.

## Projects
The IAC projects available are

| Name  | Description |
| ------------- | ------------- |
| s3-static-website  | A simple static website on S3  |
| ec2-with-ssh  | An EC2 instance with ssh access  |
| 2-node-k8s| A Kubernetes cluster with two nodes |


## Setup
Before running the projects, you need to have an AWS account setup. Then define the following environment variables. Have fun!

1. Setup with AWS environment variables
```
export AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
export AWS_REGION=<YOUR_REGION> e.g., us-east-1
```

2. Setup with AWS profiles
If you are using multiple AWS profiles defined in the ~/.aws/credentials file, you can use

```
export AWS_PROFILE=<PROFILE_TO_USE> e.g., esumitra-personal
```

Sample `~/.aws/credentials`:

```
[default]
aws_access_key_id=xxx1
aws_secret_access_key=xxx2
region=us-east-1

[esumitra-personal]
aws_access_key_id=yyy1
aws_secret_access_key=yyy2
region=us-east-1

[esumitra-teaching]
...
```
