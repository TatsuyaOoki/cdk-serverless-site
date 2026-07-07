#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { CdkServerlessSiteStack } from "../lib/cdk-serverless-site-stack";

const app = new cdk.App();
new CdkServerlessSiteStack(app, "CdkServerlessSiteStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
cdk.Tags.of(app).add("Env", "Education");
