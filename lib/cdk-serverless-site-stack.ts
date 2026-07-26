import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { App } from "./constructs/app";
import { Auth } from "./constructs/auth";
import { Storage } from "./constructs/storage";
import { Frontend } from "./constructs/frontend";
import { Backend } from "./constructs/backend";
import { Integration } from "./constructs/integration";

export interface CdkStackProps extends cdk.StackProps {
  // vpcCidr: string;
}

export class CdkServerlessSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const storage = new Storage(this, "Storage", {});

    const auth = new Auth(this, "Auth", {
      cognitoDomainName: "album-auth-serverless-site",
    });

    const backend = new Backend(this, "Backend", {
      webBucket: storage.webBucket,
    });

    const frontend = new Frontend(this, "Frontend", {
      webBucket: storage.webBucket,
      api: backend.api,
    });

    new Integration(this, "Integration", {
      distribution: frontend.distribution,
      api: backend.api,
      userPool: auth.userPool,
      listIntegration: backend.listIntegration,
      uploadUrlIntegration: backend.uploadUrlIntegration,
      registerDbIntegration: backend.registerDbIntegration,
    });
  }
}
