import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";

export interface BackendProps {}

export class Backend extends Construct {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    // Lambda
    const helloFunction = new nodejs.NodejsFunction(this, "Hello", {
      entry: path.join(__dirname, "../../lambda/hello/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
    });

    const listFunction = new nodejs.NodejsFunction(this, "List", {
      entry: path.join(__dirname, "../../lambda/photos/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
    });

    // API Gateway
    const integration = new HttpLambdaIntegration(
      "HelloIntegration",
      helloFunction,
    );

    const listIntegration = new HttpLambdaIntegration(
      "ListIntegration",
      listFunction,
    );

    const api = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigwv2.CorsHttpMethod.GET],
      },
    });

    api.addRoutes({
      path: "/hello",
      methods: [apigwv2.HttpMethod.GET],
      integration: integration,
    });

    api.addRoutes({
      path: "/photos",
      methods: [apigwv2.HttpMethod.GET],
      integration: listIntegration,
    });

    new cdk.CfnOutput(this, "HttpUrl", {
      value: api.url!,
    });
  }
}
