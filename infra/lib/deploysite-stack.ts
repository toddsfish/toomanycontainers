import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cf from 'aws-cdk-lib/aws-cloudfront'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CfnACL } from 'aws-cdk-lib/aws-memorydb';

// Used to verify that the DeployStaticSiteStack class conforms to a specific interface. In this case DeployStaticSiteStack requires a S3Bucket Object and CF Dist. Object pass into constructor for an instance of DeployStaticSiteStack to be constructed.
interface DeployStaticSiteProps extends cdk.StackProps {
  readonly s3Bucket: s3.Bucket;
  readonly cfDist: cf.Distribution;
}

export class DeployStaticSiteStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: DeployStaticSiteProps) {
    super(scope, id, props);

    new BucketDeployment(this, 'DeploySite', {
      sources: [Source.asset('../src')],
      // destination bucket
      destinationBucket: props.s3Bucket,
      // the cf distribution
      distribution: props.cfDist,
      // this will invalidate the cache on the CDN after the deployment
      distributionPaths: ['/*'],
      // this will delete the objects from the bucket on destroy making it ephemeral
      retainOnDelete: false
    });
  }
}