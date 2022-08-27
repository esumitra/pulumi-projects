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

## Setup
Before running the projects, you need to have an AWS account setup. Then define the following environment variables. Have fun!
```
export AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
```