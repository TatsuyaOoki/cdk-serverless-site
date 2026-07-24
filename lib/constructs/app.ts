import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib/core";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as route53 from "aws-cdk-lib/aws-route53";

export interface AppProps {
  readonly domainName: string;
}

export class App extends Construct {
  constructor(scope: Construct, id: string, props: AppProps) {
    super(scope, id);

    // VPC
    const vpc = new ec2.Vpc(this, "WebVPC", {
      ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "Public",
          cidrMask: 24,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // EC2 Instances
    const primaryInstance = new ec2.Instance(this, "PrimaryInstance", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.NANO,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      ssmSessionPermissions: true,
    });

    primaryInstance.connections.allowFromAnyIpv4(ec2.Port.HTTP);
    primaryInstance.userData.addCommands(
      "dnf install -y httpd",
      "systemctl enable httpd",
      "systemctl start httpd",
      "echo '<h1>Primary Instance</h1>' > /var/www/html/web.html",
      "echo '<h1>Primary Instance</h1>' > /var/www/html/app.html",
    );

    // Secondary Instance
    const secondaryInstance = new ec2.Instance(this, "SecondaryInstance", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.NANO,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cachedInContext: true,
      }),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      ssmSessionPermissions: true,
    });

    secondaryInstance.connections.allowFromAnyIpv4(ec2.Port.HTTP);
    secondaryInstance.userData.addCommands(
      "dnf install -y httpd",
      "systemctl enable httpd",
      "systemctl start httpd",
      "echo '<h1>Secondary Instance</h1>' > /var/www/html/web.html",
      "echo '<h1>Secondary Instance</h1>' > /var/www/html/app.html",
    );

    // Health Check
    const webPrimaryHealthCheck = new route53.HealthCheck(
      this,
      "WebPrimaryHealthCheck",
      {
        type: route53.HealthCheckType.HTTP,
        fqdn: primaryInstance.instancePublicDnsName,
        port: 80,
        resourcePath: "/web.html",
      },
    );

    const webSecondaryHealthCheck = new route53.HealthCheck(
      this,
      "WebSecondaryHealthCheck",
      {
        type: route53.HealthCheckType.HTTP,
        fqdn: secondaryInstance.instancePublicDnsName,
        port: 80,
        resourcePath: "/web.html",
      },
    );

    const appPrimaryHealthCheck = new route53.HealthCheck(
      this,
      "AppPrimaryHealthCheck",
      {
        type: route53.HealthCheckType.HTTP,
        fqdn: primaryInstance.instancePublicDnsName,
        port: 80,
        resourcePath: "/app.html",
      },
    );

    const appSecondaryHealthCheck = new route53.HealthCheck(
      this,
      "AppSecondaryHealthCheck",
      {
        type: route53.HealthCheckType.HTTP,
        fqdn: secondaryInstance.instancePublicDnsName,
        port: 80,
        resourcePath: "/app.html",
      },
    );

    // Route53 Hosted Zone
    const hostedZone = new route53.HostedZone(this, "HostedZone", {
      zoneName: props.domainName,
    });

    // // Route53 Records
    new route53.ARecord(this, "WebPrimary", {
      zone: hostedZone,
      recordName: "web",
      target: route53.RecordTarget.fromIpAddresses(
        primaryInstance.instancePublicIp,
      ),
      failover: route53.Failover.PRIMARY,
      healthCheck: webPrimaryHealthCheck,
    });

    new route53.ARecord(this, "WebSecondary", {
      zone: hostedZone,
      recordName: "web",
      target: route53.RecordTarget.fromIpAddresses(
        secondaryInstance.instancePublicIp,
      ),
      failover: route53.Failover.SECONDARY,
      healthCheck: webSecondaryHealthCheck,
    });

    new route53.ARecord(this, "AppPrimary", {
      zone: hostedZone,
      recordName: "app",
      target: route53.RecordTarget.fromIpAddresses(
        primaryInstance.instancePublicIp,
      ),
      failover: route53.Failover.PRIMARY,
      healthCheck: appPrimaryHealthCheck,
    });

    new route53.ARecord(this, "AppSecondary", {
      zone: hostedZone,
      recordName: "app",
      target: route53.RecordTarget.fromIpAddresses(
        secondaryInstance.instancePublicIp,
      ),
      failover: route53.Failover.SECONDARY,
      healthCheck: appSecondaryHealthCheck,
    });
  }
}
