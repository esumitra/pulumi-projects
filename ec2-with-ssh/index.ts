import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// specify AMI properties
const amiName:string = "amzn2-ami-hvm-*-x86_64-ebs";
const size = "t2.micro";     // t2.micro is available in the AWS free tier

// create AMI instance
const ami = aws.ec2.getAmiOutput({
  filters: [{
      name: "name",
      values: [amiName],
  }],
  owners: ["137112412989"], // This owner ID is Amazon
  mostRecent: true,
});

// create security group
const securityGroup = new aws.ec2.SecurityGroup("webserver-secgrp", {
  ingress: [
      { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
  ],
});


// create user data to install SSM
const userData:string = `#!/bin/bash
set -ex

cd /tmp
sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
`;

// create an instance with AMI and security group
const server = new aws.ec2.Instance("webserver-www", {
  instanceType: size,
  vpcSecurityGroupIds: [ securityGroup.id ], // reference the security group resource above
  ami: ami.id,
  keyName: "k8-servers",
  // userData: userData
});

const successMessage = 'connect to the instance using the command: ssh -i  <key-pair.pem> ec2-user@$(pulumi stack output publicHostName)';
console.log(successMessage);

// export instance details
export const publicIp = server.publicIp;
export const publicHostName = server.publicDns;
export const instanceId = server.id;
