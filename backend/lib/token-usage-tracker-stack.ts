import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class TokenUsageTrackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const tokenUsageTable = new dynamodb.Table(this, 'TokenUsageTable', {
      tableName: 'TokenUsageTable',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true
    });

    // Common Lambda environment variables
    const lambdaEnvironment = {
      TABLE_NAME: tokenUsageTable.tableName
    };

    // Lambda Functions
    const createUserFn = new lambda.Function(this, 'CreateUserFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/createUser.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30)
    });

    const getUserUsageFn = new lambda.Function(this, 'GetUserUsageFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/getUserUsage.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30)
    });

    const updateTokenLimitFn = new lambda.Function(this, 'UpdateTokenLimitFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/updateTokenLimit.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30)
    });

    const recordTokenUsageFn = new lambda.Function(this, 'RecordTokenUsageFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/recordTokenUsage.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30)
    });

    const listAllUsersFn = new lambda.Function(this, 'ListAllUsersFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/listAllUsers.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(30)
    });

    const invokeModelFn = new lambda.Function(this, 'InvokeModelFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/invokeModel.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      environment: lambdaEnvironment,
      timeout: cdk.Duration.seconds(60)
    });

    // Grant DynamoDB permissions
    tokenUsageTable.grantReadWriteData(createUserFn);
    tokenUsageTable.grantReadWriteData(getUserUsageFn);
    tokenUsageTable.grantReadWriteData(updateTokenLimitFn);
    tokenUsageTable.grantReadWriteData(recordTokenUsageFn);
    tokenUsageTable.grantReadData(listAllUsersFn);
    tokenUsageTable.grantReadWriteData(invokeModelFn);

    // Grant Bedrock permissions to invokeModel function
    invokeModelFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*']
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'TokenUsageTrackerApi', {
      restApiName: 'Token Usage Tracker API',
      description: 'API for token usage tracking system',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });

    // API Resources and Methods
    const users = api.root.addResource('users');
    users.addMethod('POST', new apigateway.LambdaIntegration(createUserFn));
    users.addMethod('GET', new apigateway.LambdaIntegration(listAllUsersFn));

    const user = users.addResource('{userId}');
    user.addMethod('GET', new apigateway.LambdaIntegration(getUserUsageFn));

    const limit = user.addResource('limit');
    limit.addMethod('PUT', new apigateway.LambdaIntegration(updateTokenLimitFn));

    const usage = user.addResource('usage');
    usage.addMethod('POST', new apigateway.LambdaIntegration(recordTokenUsageFn));

    const invoke = api.root.addResource('invoke');
    const invokeUser = invoke.addResource('{userId}');
    invokeUser.addMethod('POST', new apigateway.LambdaIntegration(invokeModelFn));

    // S3 Bucket for Frontend
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `token-usage-tracker-${this.account}-${this.region}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // For SPA routing
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: 'Token Usage Tracker Frontend Distribution'
    });

    // Deploy Frontend to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/dist'))],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
      prune: true
    });

    // Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: tokenUsageTable.tableName,
      description: 'DynamoDB table name for token usage'
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL'
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront distribution URL for frontend'
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID'
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 bucket name for frontend'
    });
  }
}
