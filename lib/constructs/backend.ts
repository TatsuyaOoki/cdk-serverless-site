import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as s3 from "aws-cdk-lib/aws-s3";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as path from "path";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export interface BackendProps {
  readonly webBucket: s3.IBucket;
  readonly distribution: cloudfront.IDistribution;
}

export class Backend extends Construct {
  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    // DynamoDB
    const photoTable = new dynamodb.TableV2(this, "Photos", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billing: dynamodb.Billing.onDemand(),
    });

    // Lambda
    const listFunction = new nodejs.NodejsFunction(this, "List", {
      entry: path.join(__dirname, "../../lambda/photos/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      environment: {
        TABLE_NAME: photoTable.tableName,
        CLOUDFRONT_DOMAIN: props.distribution.distributionDomainName,
      },
    });

    const uploadUrlFunction = new nodejs.NodejsFunction(this, "UploadUrl", {
      entry: path.join(__dirname, "../../lambda/upload-url/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      environment: {
        BUCKET_NAME: props.webBucket.bucketName,
      },
    });

    const registerDbFunction = new nodejs.NodejsFunction(this, "RegisterDb", {
      entry: path.join(__dirname, "../../lambda/register-db/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      environment: {
        TABLE_NAME: photoTable.tableName,
      },
    });

    photoTable.grants.readData(listFunction);
    props.webBucket.grantPut(uploadUrlFunction);
    photoTable.grants.writeData(registerDbFunction);

    // API Gateway
    const listIntegration = new HttpLambdaIntegration(
      "ListIntegration",
      listFunction,
    );

    const uploadUrlIntegration = new HttpLambdaIntegration(
      "UploadUrlIntegration",
      uploadUrlFunction,
    );

    const registerDbIntegration = new HttpLambdaIntegration(
      "RegisterDbIntegration",
      registerDbFunction,
    );

    const api = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
        ],
        allowHeaders: ["Content-Type"],
      },
    });

    api.addRoutes({
      path: "/photos",
      methods: [apigwv2.HttpMethod.GET],
      integration: listIntegration,
    });

    api.addRoutes({
      path: "/photos/upload-url",
      methods: [apigwv2.HttpMethod.POST],
      integration: uploadUrlIntegration,
    });

    api.addRoutes({
      path: "/photos/register-db",
      methods: [apigwv2.HttpMethod.POST],
      integration: registerDbIntegration,
    });

    new URL(api.httpApiName).

    new cdk.CfnOutput(this, "HttpUrl", {
      value: api.url!,
    });
  }
}
