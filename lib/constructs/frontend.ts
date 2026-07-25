import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export interface FrontendProps {
  readonly webBucket: s3.IBucket;
}

export class Frontend extends Construct {
  public readonly distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, "Web", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.webBucket),
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
