import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

export interface BackendProps {}

export class Backend extends Construct {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    // Lambda
    new nodejs.NodejsFunction(this, "Hello", {
      entry: path.join(__dirname, "../../lambda/hello/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
    });
  }
}
