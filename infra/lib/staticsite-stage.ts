import { StaticSiteStack } from './staticsite-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

// declare a new child of Stage class (component of a pipeline) https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stage.html, and in that Stage instantiate StaticSiteStack application stack.
export class StaticSiteStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        new StaticSiteStack(this, 'StaticSite');
    }
}