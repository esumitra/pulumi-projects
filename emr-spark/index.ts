import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as conf from "./config"

// const app = new aws.emrserverless.Application("sparkApp", {
//   // replace with your properties
//   initialCapacities: [{
//     initialCapacityConfig: {
//       workerConfiguration: {
//           cpu: "2vCPU",
//           memory: "10GB",
//       },
//       workerCount: 2,
//     },
//     initialCapacityType: "Executor",
//   },{
//     initialCapacityConfig: {
//       workerConfiguration: {
//           cpu: "2vCPU",
//           memory: "4GB",
//       },
//       workerCount: 1,
//     },
//     initialCapacityType: "Driver",
//   }],
//   releaseLabel: "emr-6.12.0",
//   type: "spark",
// });

function createEmrClusterFromConfig(conf: conf.EmrConfig): aws.emrserverless.Application {
  // create initial capcities configuration for cluster
  const capacities = conf.initialCapacities.map ( capacityConfig => ({
    initialCapacityConfig: {
      workerCount: capacityConfig.initialCapacityConfig.workerCount,
      workerConfiguration: {
        cpu: capacityConfig.initialCapacityConfig.workerConfiguration.cpu,
        memory: capacityConfig.initialCapacityConfig.workerConfiguration.memory
      }
    },
    initialCapacityType: capacityConfig.initialCapacityType
  }));
  
  // create serverless app
  const app = new aws.emrserverless.Application(conf.name, {
    initialCapacities: capacities,
    releaseLabel: conf.appVersion.releaseLabel,
    type: conf.appVersion.type,
  });
  return app;
}

const emrApp = createEmrClusterFromConfig(conf.emrConfig);

// Export the name of the Application
export const appName = emrApp.name;
export const appId = emrApp.id;