import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";
import { StaticSiteStage } from './staticsite-stage';
import { create } from 'domain';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'StaticSitePipeline',
      synth: new CodeBuildStep('SynthStep', {
          input: CodePipelineSource.connection('toddsfish/toomanycontainers', 'main', {
            connectionArn: 'arn:aws:codestar-connections:ap-southeast-2:302766791300:connection/853f1d55-685e-46d6-af0a-d7256c1052aa'
          }),
          installCommands: [
              'npm install -g aws-cdk'
          ],
          commands: [
              'cd ./infra',
              'npm ci',
              'npm run build',
              'npx cdk synth'
          ],
          primaryOutputDirectory: './infra/cdk.out'
        }
      ),
      /* selfMutation: This needs to be set to true to allow the pipeline to reconfigure itself when assets or stages are being added to it, and true is the recommended setting.
      You can temporarily set this to false while you are iterating on the pipeline itself and prefer to deploy changes using cdk deploy. */
      selfMutation: true,
      useChangeSets: true
    });

    // Defines a stage to create Static Site via CDK pipelines
    const createStaticSite = new StaticSiteStage(this, 'StaticSiteStage');
    // TODO: Add pre and post automated test to the stage to i.e http test site
    pipeline.addStage(createStaticSite);

  }
}