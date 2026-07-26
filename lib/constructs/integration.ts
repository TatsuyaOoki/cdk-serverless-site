import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export interface IntegrationProps {
  readonly distribution: cloudfront.IDistribution;
  readonly api: apigwv2.HttpApi;
  readonly userPool: cognito.IUserPool;
  readonly listIntegration: HttpLambdaIntegration;
  readonly uploadUrlIntegration: HttpLambdaIntegration;
  readonly registerDbIntegration: HttpLambdaIntegration;
}

export class Integration extends Construct {
  constructor(scope: Construct, id: string, props: IntegrationProps) {
    super(scope, id);

    // Cognito
    const userPoolClient = props.userPool.addClient("UserPoolClient", {
      generateSecret: false,
      oAuth: {
        callbackUrls: [`https://${props.distribution.distributionDomainName}`],
        logoutUrls: [`https://${props.distribution.distributionDomainName}`],
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
      },
    });

    const authorizer = new HttpUserPoolAuthorizer(
      "UserPoolAuthorizer",
      props.userPool,
      {
        userPoolClients: [userPoolClient],
      },
    );

    // api gateway route
    props.api.addRoutes({
      path: "/api/photos",
      methods: [apigwv2.HttpMethod.GET],
      integration: props.listIntegration,
    });

    props.api.addRoutes({
      path: "/api/photos/upload-url",
      methods: [apigwv2.HttpMethod.POST],
      integration: props.uploadUrlIntegration,
      authorizer,
    });

    props.api.addRoutes({
      path: "/api/photos/register-db",
      methods: [apigwv2.HttpMethod.POST],
      integration: props.registerDbIntegration,
      authorizer,
    });
  }
}
