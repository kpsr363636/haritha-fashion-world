#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HarithaStack } from '../lib/haritha-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
};

new HarithaStack(app, 'HarithaFashionStack', {
  env,
  description: 'Haritha Fashion World ECS RDS Redis S3 CloudFront',
});

app.synth();
