#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StaticSiteStack } from '../lib/staticsite-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';

const app = new cdk.App();
const pipelineStack = new PipelineStack(app, 'PipelineStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});

// ## Commented out as is deloyed via CDK pipelines
// new StaticSiteStack(app, 'StaticSiteStack', {

//   env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

// CDK Nag config
cdk.Aspects.of(app).add(new AwsSolutionsChecks({
  verbose: true
}));

// CDK Nag config suppress CDK pipelines warnings
NagSuppressions.addStackSuppressions(pipelineStack, [
  { id: 'AwsSolutions-S1', reason: 'Suppress CDK pipelines warnings' },
  { id: 'AwsSolutions-IAM5', reason: 'Suppress CDK pipelines warnings' },
  { id: 'AwsSolutions-CB4', reason: 'Suppress CDK pipelines warnings' },
]);