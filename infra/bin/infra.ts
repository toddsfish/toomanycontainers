#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StaticSiteStack } from '../lib/staticsite-stack';
import { AwsSolutionsChecks } from 'cdk-nag';

const app = new cdk.App();
new StaticSiteStack(app, 'StaticSiteStack', {

  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

// CDK Nag config
cdk.Aspects.of(app).add(new AwsSolutionsChecks({
  verbose: true
}));