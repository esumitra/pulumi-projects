import { Config } from "@pulumi/pulumi";

export type AppVersion = {
  type: "spark" | "hive",
  releaseLabel: string
}

export type InitialCapacitiesType  = {
  initialCapacityType: "Executor" | "Driver",
  initialCapacityConfig: {
    workerConfiguration: {
      cpu: string,
      memory: string
    },
    workerCount: number
  }
}

export type EmrConfig = {
  name: string,
  appVersion: AppVersion,
  initialCapacities: Array<InitialCapacitiesType>
};

const emrConfigKey: string = "emrConfig";

const config = new Config();

export const emrConfig: EmrConfig = config.requireObject<EmrConfig>(emrConfigKey);
