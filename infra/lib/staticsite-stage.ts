import { StaticSiteStack } from './staticsite-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Derive a subclass of Stage and use it to model a single instance of your application. https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stage.html
// declares a new child of Stage class (component of a pipeline) https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stage.html, and within the Stage instantiate StaticSiteStack application stack.
export class StaticSiteDeployStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    // defines the stack (staticSiteStack) to be deployed within the stage
    new StaticSiteStack(this, 'StaticSite');
    // Add more stacks to stage here... // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stage.html CDK Pipelines will automatically discover all Stacks in the given Stage object, determine their dependency order, and add appropriate actions to the pipeline to publish the assets referenced in those stacks and deploy the stacks in the right order.
  }
} 