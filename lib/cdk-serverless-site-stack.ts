import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { App } from "./constructs/app";
import { Storage } from "./constructs/storage";
import { Frontend } from "./constructs/frontend";

export interface CdkStackProps extends cdk.StackProps {
  // vpcCidr: string;
}

export class CdkServerlessSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const storage = new Storage(this, "Storage", {});
    const frontend = new Frontend(this, "Frontend", {
      webBucket: storage.webBucket,
    });
  }
}
