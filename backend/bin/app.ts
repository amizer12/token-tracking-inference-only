#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TokenUsageTrackerStack } from '../lib/token-usage-tracker-stack';

const app = new cdk.App();
new TokenUsageTrackerStack(app, 'TokenUsageTrackerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});
