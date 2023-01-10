import { Config } from "@pulumi/pulumi";

export type Ec2Config  = {
  amiId: string,
  instanceSize: string,
  instanceName: string,
  securityGroupName: string,
  keyPair: {
    name:string,
    publicKey: string
  },
  openPorts?: number[],
  userData?: string
};

const ec2ConfigKey: string = "ec2Config";

const config = new Config();

export const ec2Config: Ec2Config = config.requireObject<Ec2Config>(ec2ConfigKey);



