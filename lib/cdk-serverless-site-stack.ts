import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { App } from "./constructs/app";

export interface CdkStackProps extends cdk.StackProps {
  // vpcCidr: string;
}

export class CdkServerlessSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    new App(this, "App", {
      domainName: "test.click",
    });
  }
}
