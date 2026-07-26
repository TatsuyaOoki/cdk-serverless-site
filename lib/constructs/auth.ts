import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface AuthProps {
  readonly cognitoDomainName: string;
}

export class Auth extends Construct {
  public readonly userPool: cognito.IUserPool;
  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    // Cognito
    const userPool = new cognito.UserPool(this, "UserPool", {
      removalPolicy: RemovalPolicy.DESTROY,
      signInAliases: { email: true },
      selfSignUpEnabled: true,
    });

    userPool.addDomain("UserPoolDomain", {
      cognitoDomain: {
        domainPrefix: props.cognitoDomainName,
      },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });
    this.userPool = userPool;
  }
}
