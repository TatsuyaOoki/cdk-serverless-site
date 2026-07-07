import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export interface FrontendProps {
  readonly webBucket: s3.IBucket;
}

export class Frontend extends Construct {
  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    const distribution = new cloudfront.Distribution(this, "Web", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.webBucket),
      },
    });
  }
}
