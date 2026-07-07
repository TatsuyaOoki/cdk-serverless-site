import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface AppProps {
  // vpc: ec2.IVpc;
}

export class App extends Construct {
  constructor(scope: Construct, id: string, props: AppProps) {
    super(scope, id);
  }
}
