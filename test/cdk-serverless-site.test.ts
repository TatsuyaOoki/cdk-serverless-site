// import * as cdk from 'aws-cdk-lib/core';
import { Template } from "aws-cdk-lib/assertions";
import { CdkServerlessSiteStack } from "../lib/cdk-serverless-site-stack";
import { App } from "aws-cdk-lib";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/cdk-serverless-site-stack.ts

describe("MyStack Tests", () => {
  test("Snapshot Tests", () => {
    const app = new App();
    const stack = new CdkServerlessSiteStack(app, "TestStack", {
      // vpcCidr: "10.0.0.0/16", // スタックで必要なパラメータがあれば記載
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});

// test("SQS Queue Created", () => {
//   const app = new cdk.App();
//     // WHEN
//   const stack = new CdkServerlessSite.CdkServerlessSiteStack(app, 'MyTestStack');
//     // THEN
//   const template = Template.fromStack(stack);
//   template.hasResourceProperties('AWS::SQS::Queue', {
//     VisibilityTimeout: 300
//   });
// });
