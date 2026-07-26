import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";

export interface FrontendProps {
  readonly webBucket: s3.IBucket;
  readonly api: apigwv2.IHttpApi;
}

export class Frontend extends Construct {
  public readonly distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, "Web", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.webBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "/api/*": {
          origin: new origins.HttpOrigin(
            // abc.execute-api.<region>.amazonaws.com
            cdk.Fn.select(2, cdk.Fn.split("/", props.api.apiEndpoint)),
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      defaultRootObject: "index.html",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    // S3 Deploy
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./assets/site")],
      destinationBucket: props.webBucket,
      distribution,
      distributionPaths: ["/*"],
    });
    this.distribution = distribution;
  }
}
