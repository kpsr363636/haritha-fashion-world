import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class HarithaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── VPC (no NAT gateway — dev cost savings; Fargate uses public IP) ──
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // ── Security groups ──
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc,
      description: 'ALB HTTP HTTPS from internet',
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');

    const fargateSg = new ec2.SecurityGroup(this, 'FargateSg', {
      vpc,
      description: 'ECS Fargate backend',
      allowAllOutbound: true,
    });
    fargateSg.addIngressRule(albSg, ec2.Port.tcp(8080), 'From ALB');

    const dbSg = new ec2.SecurityGroup(this, 'DbSg', {
      vpc,
      description: 'RDS PostgreSQL',
      allowAllOutbound: false,
    });
    dbSg.addIngressRule(fargateSg, ec2.Port.tcp(5432), 'From Fargate');

    const redisSg = new ec2.SecurityGroup(this, 'RedisSg', {
      vpc,
      description: 'ElastiCache Redis',
      allowAllOutbound: false,
    });
    redisSg.addIngressRule(fargateSg, ec2.Port.tcp(6379), 'From Fargate');

    // ── RDS PostgreSQL ──
    const dbCredentials = rds.Credentials.fromGeneratedSecret('haritha', {
      secretName: 'haritha/db-credentials',
    });

    const database = new rds.DatabaseInstance(this, 'Postgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [dbSg],
      credentials: dbCredentials,
      databaseName: 'haritha_fashion',
      allocatedStorage: 20,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(0),
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      publiclyAccessible: false,
    });

    // ── ElastiCache Redis ──
    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Haritha Redis subnet group',
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
      cacheSubnetGroupName: 'haritha-redis-subnets',
    });

    const redisCluster = new elasticache.CfnCacheCluster(this, 'Redis', {
      cacheNodeType: 'cache.t4g.micro',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [redisSg.securityGroupId],
      cacheSubnetGroupName: redisSubnetGroup.cacheSubnetGroupName!,
    });
    redisCluster.addDependency(redisSubnetGroup);

    // ── App secrets (JWT + third-party keys — fill after deploy) ──
    const appSecret = new secretsmanager.Secret(this, 'AppSecret', {
      secretName: 'haritha/app-config',
      description: 'Haritha Fashion World application secrets',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          JWT_SECRET: '',
          RAZORPAY_KEY_ID: '',
          RAZORPAY_KEY_SECRET: '',
          RAZORPAY_WEBHOOK_SECRET: '',
          MSG91_API_KEY: '',
          GOOGLE_CLIENT_ID: '',
        }),
        generateStringKey: 'JWT_SECRET',
        excludePunctuation: true,
        passwordLength: 48,
      },
    });

    // ── S3 buckets ──
    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: undefined,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ── ECR ──
    const repository = new ecr.Repository(this, 'BackendRepo', {
      repositoryName: 'haritha-fashion-backend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
      lifecycleRules: [{ maxImageCount: 10 }],
    });

    // ── ECS Fargate ──
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    const logGroup = new logs.LogGroup(this, 'BackendLogs', {
      logGroupName: '/haritha/backend',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    mediaBucket.grantReadWrite(taskRole);
    appSecret.grantRead(taskRole);
    database.secret!.grantRead(taskRole);

    const executionRole = new iam.Role(this, 'ExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });
    database.secret!.grantRead(executionRole);
    appSecret.grantRead(executionRole);

    const taskDef = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole,
      executionRole,
    });

    const container = taskDef.addContainer('Backend', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'backend', logGroup }),
      environment: {
        SPRING_PROFILES_ACTIVE: 'prod',
        AWS_REGION: cdk.Stack.of(this).region,
        S3_BUCKET: mediaBucket.bucketName,
        REDIS_PORT: '6379',
        REDIS_SSL: 'false',
      },
      secrets: {
        DB_USER: ecs.Secret.fromSecretsManager(database.secret!, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(database.secret!, 'password'),
        JWT_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'JWT_SECRET'),
        RAZORPAY_KEY_ID: ecs.Secret.fromSecretsManager(appSecret, 'RAZORPAY_KEY_ID'),
        RAZORPAY_KEY_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'RAZORPAY_KEY_SECRET'),
        RAZORPAY_WEBHOOK_SECRET: ecs.Secret.fromSecretsManager(appSecret, 'RAZORPAY_WEBHOOK_SECRET'),
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:8080/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(10),
        retries: 3,
        startPeriod: cdk.Duration.seconds(120),
      },
    });
    container.addPortMappings({ containerPort: 8080 });

    // DB_URL and Redis host injected via environment (resolved at deploy time)
    container.addEnvironment(
      'DB_URL',
      `jdbc:postgresql://${database.dbInstanceEndpointAddress}:5432/haritha_fashion`,
    );
    container.addEnvironment('REDIS_HOST', redisCluster.attrRedisEndpointAddress);

    const service = new ecs.FargateService(this, 'BackendService', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [fargateSg],
      circuitBreaker: { rollback: true },
      healthCheckGracePeriod: cdk.Duration.seconds(300),
    });

    // ── ALB ──
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    const listener = alb.addListener('HttpListener', { port: 80, open: true });
    listener.addTargets('BackendTarget', {
      port: 8080,
      targets: [service],
      healthCheck: {
        path: '/api/health',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(15),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // ── CloudFront (SPA + API proxy) ──
    const apiOrigin = new origins.LoadBalancerV2Origin(alb, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
    });

    const frontendOac = new cloudfront.S3OriginAccessControl(this, 'FrontendOac', {
      originAccessControlName: 'haritha-frontend-oac',
    });

    const customDomain = this.node.tryGetContext('customDomain') as string | undefined;
    const certificateArn = this.node.tryGetContext('certificateArn') as string | undefined;
    const customDomainNames =
      customDomain && certificateArn
        ? [customDomain, `www.${customDomain}`]
        : undefined;
    const siteCertificate =
      customDomain && certificateArn
        ? acm.Certificate.fromCertificateArn(this, 'SiteCertificate', certificateArn)
        : undefined;

    const distribution = new cloudfront.Distribution(this, 'Cdn', {
      ...(customDomainNames && siteCertificate
        ? { domainNames: customDomainNames, certificate: siteCertificate }
        : {}),
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket, {
          originAccessControl: frontendOac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: apiOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
    });

    const cloudfrontUrl = `https://${distribution.distributionDomainName}`;
    const publicSiteUrl = customDomain ? `https://${customDomain}` : cloudfrontUrl;
    const corsOrigins = customDomain
      ? `${cloudfrontUrl},https://${customDomain},https://www.${customDomain}`
      : cloudfrontUrl;

    container.addEnvironment('CLOUDFRONT_DOMAIN', cloudfrontUrl);
    container.addEnvironment('CORS_ORIGINS', corsOrigins);
    container.addEnvironment('FRONTEND_URL', publicSiteUrl);

    // ── Outputs ──
    new cdk.CfnOutput(this, 'SiteUrl', {
      value: publicSiteUrl,
      description: 'Public site URL (custom domain when configured)',
    });
    if (customDomain) {
      new cdk.CfnOutput(this, 'CustomDomain', {
        value: customDomain,
        description: 'Custom domain — point DNS CNAME to CloudFrontDomain',
      });
    }
    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
    });
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
    });
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
    });
    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
    });
    new cdk.CfnOutput(this, 'EcsServiceName', {
      value: service.serviceName,
    });
    new cdk.CfnOutput(this, 'DbSecretArn', {
      value: database.secret!.secretArn,
    });
    new cdk.CfnOutput(this, 'AppSecretArn', {
      value: appSecret.secretArn,
    });
    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: redisCluster.attrRedisEndpointAddress,
    });
  }
}
