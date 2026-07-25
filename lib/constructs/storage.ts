import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface StorageProps {}

export class Storage extends Construct {
  public readonly webBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StorageProps) {
    super(scope, id);

    this.webBucket = new s3.Bucket(this, "WebBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["Content-Type"],
        },
      ],
    });
  }
}
