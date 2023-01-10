# An AWS EC2 instance with Linux
The project contains the infrastructure code to create a Linux EC2 instance

## EC2 Configuration
The following parameters need to be specified under the key `ec2Config` to create the static website

- **imageId**: Image id to use for the instance
- **instanceSize**: Filter for image size. e.g., `t2.micro`
- **instanceName**: Name of the instance. A unique id suffix will be added to the name.
- **securityGroupName**: Name of the security group to create
- **keyPair.name**: Name of the keypair to create or update
- **keyPair.publicKey**: Public key of the keypair to create or update
- **openPorts**: [Optional] Additional open ports to open. Port 22 will be open by default to enable ssh access to the instance using the key pair specified in the configuration
- **userData**: [Optional] Additional user data commands to execute when instance is started. An amazon ssm agent will be installed by default





## Create and update Infrastructure
1. Configure the EC2 instance
Image name:
To find the image id use the AWS console or the CLI with the command below

```
aws ec2 describe-images \
    --owners 137112412989 \
    --query 'Images[*].[CreationDate,Name,ImageId]' \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-ebs" \
    --region us-east-1 \
    --output table \
  | sort -r
```

To configure pulumi, update the `Pulumi.<stack>.yaml` file. A sample configuration is shown below

```
config:
  aws:region: us-east-1
  ec2-with-ssm:ec2Config:
    amiId: ami-033f230e26210618e
    instanceSize: 't2.micro'
    instanceName: simple-ec2
    securityGroupName: 'basic-ec2'
    keyPair:
      name: 'ec2-ssh-key'
      publicKey: 'ssh-rsa abunchofcharacters user@org'
```

2. Create EC2 instance with the specified configuration

Run `pulumi up` and select yes

Sample output
```
publicHostName: "ec2-18-212-35-35.compute-1.amazonaws.com"
publicIp      : "18.212.35.35"
instanceId    : "i-041860798a6799a5f"
```

[<img src="./images/pulumi-create.png" width="400"/>](./images/pulumi-create.png)


2. Login to the instance using
```
ssh -i  <key-pair.pem> ec2-user@$(pulumi stack output publicHostName)
```

3. Delete Infrastructure
Run `pulumi destroy` and select yes

Sample output

[<img src="./images/pulumi-destroy.png" width="400"/>](./images/pulumi-destroy.png)

## Infrastructure Setup Steps
1. Create security group with ssh access
2. Create ssh keypair
3. Create EC2 instance with configuration, security group, and resources

## License
Copyright 2023, Edward Sumitra

Licensed under the MIT License.
