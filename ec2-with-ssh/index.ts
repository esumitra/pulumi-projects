import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { ec2Config} from "./config"

function createSecurityGroup(secGroupName: string,  openPorts: number[] = []): aws.ec2.SecurityGroup {
  const sshPort = [22];
  const ingressPorts = [...sshPort, ...openPorts];
  const ingressEntries = ingressPorts.map (p => ({
    protocol: "tcp", fromPort: p, toPort: p, cidrBlocks: ["0.0.0.0/0"]
  }));
  return new aws.ec2.SecurityGroup(secGroupName, {
    ingress: ingressEntries,
    egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
  });
};

function createUpdateKeypair(keyName: string, publicKey: string): aws.ec2.KeyPair {
  return new aws.ec2.KeyPair(keyName, {
    publicKey: publicKey
  });
}

// create user data to install SSM
const ssmUserData:string = `#!/bin/bash
set -ex

cd /tmp
sudo yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent
`;

// create an instance with AMI and security group
function createInstance(amiId: string, instanceName: string, instanceSize: string, securityGroup: aws.ec2.SecurityGroup, keyPair: aws.ec2.KeyPair) {
  return new aws.ec2.Instance(instanceName, {
    instanceType: instanceSize,
    vpcSecurityGroupIds: [ securityGroup.id ], // reference the security group resource above
    ami: amiId,
    keyName: keyPair.keyName,
    userData: ssmUserData
  });
};

const secGroup = createSecurityGroup(ec2Config.securityGroupName);
const keyPair: aws.ec2.KeyPair = createUpdateKeypair(ec2Config.keyPair.name, ec2Config.keyPair.publicKey);
const server = createInstance(ec2Config.amiId, ec2Config.instanceName, ec2Config.instanceSize, secGroup, keyPair);



// export instance details
export const publicIp = pulumi.interpolate`server ip: ${server.publicIp}`;
export const publicHostName = pulumi.interpolate`server hostname: ${server.publicDns}`;
export const instanceId = pulumi.interpolate`server id: ${server.id}`;

