import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cf from 'aws-cdk-lib/aws-cloudfront'
import * as iam from 'aws-cdk-lib/aws-iam'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { NagSuppressions } from 'cdk-nag';

export class StaticSiteStack extends cdk.Stack {

  // create readonly (Read-only members can be accessed outside the class, but their value cannot be changed) Bucket object to host the site content
  readonly s3Bucket: s3.Bucket

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket to host the site content
    this.s3Bucket = new s3.Bucket(this, 'HostingBucket', {
      enforceSSL: true,
      // If defined without "serverAccessLogsBucket", enables access server access logs to current bucket with this prefix.
      serverAccessLogsPrefix: 'serverAccessLogs',
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      // This will remove the objects and bucket on destroy making it ephemeral
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // At time of coding CDK still does not support OAC using OAI 
    const cfOai = new cf.OriginAccessIdentity(this, 'cfOai', {
      comment: 'oai'
    });

    // Add OAI to bucket policy
    this.s3Bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [this.s3Bucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cfOai.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }))

    // Cloudfront distribution fronting the site
    const cfDist = new cf.Distribution(this, 'CloudfrontDist', {
      defaultBehavior: {
        origin: new S3Origin(this.s3Bucket),
        compress: true,
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      geoRestriction: cf.GeoRestriction.allowlist('AU', 'US', 'GB'),
      // The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution.
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cf.SecurityPolicyProtocol.TLS_V1_2_2021,
      enableLogging: true,
      logBucket: this.s3Bucket,
    });
    // Suppressing TLS warning, know cert installed as using default CFN cert
    NagSuppressions.addResourceSuppressions(
      cfDist,
      [
        {
          id: 'AwsSolutions-CFR4',
          reason: 'Using default (.cloudfront.net) CFN cert',
          //appliesTo:
        },
        {
          id: 'AwsSolutions-CFR2',
          reason: 'Not using WAF at this point',
          //appliesTo:
        }, 
      ]
    );

    new BucketDeployment(this, 'DeploySite', {
      sources: [Source.asset('../src')],
      destinationBucket: this.s3Bucket,
      retainOnDelete: false
    });

    // Provide some outputs via CFN output
    new cdk.CfnOutput(this, 's3BucketOutput', {
      value: this.s3Bucket.bucketName
    })
    new cdk.CfnOutput(this, 's3BucketDomainOutput', {
      value: this.s3Bucket.bucketDomainName
    })
    new cdk.CfnOutput(this, 'cfDistOutput', {
      value: cfDist.domainName
    })
  }
}
