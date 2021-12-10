import type { AWS } from "@serverless/typescript";

import hello from "@functions/hello";
import auth from "@functions/auth";
import getTodos from "@functions/getTodos";
import createTodo from "@functions/createTodo";
import updateTodo from "@functions/updateTodo";
import deleteTodo from "@functions/deleteTodo";
import generateUploadUrl from "@functions/generateUploadUrl";

const serverlessConfiguration: AWS = {
  org: "karnoldf",
  app: "serverless-todo-app",
  service: "serverless-todo-app",
  frameworkVersion: "2",
  plugins: [
    "serverless-esbuild",
    "serverless-plugin-canary-deployments",
    "serverless-iam-roles-per-function",
    "serverless-plugin-tracing",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      TODOS_TABLE: "Todos-t-${self:provider.stage}",
      TODOS_CREATED_AT_INDEX: "CreatedAtIndex",
      ATTACHMENT_S3_BUCKET:
        "aws-serverless-kaft-4-todo-images-${self:provider.stage}",
      SIGNED_URL_EXPIRATION: "300",
      AUTH0_SECRET:
        "lLi8-6u87Pv1KArg4kwEG6_iZA4rL74TnBzpmZSyo-iJmX212zyoyUte7dNwCr7t",
    },
    lambdaHashingVersion: "20201221",
    stage: "${opt:stage, 'dev'}",
    region: "sa-east-1",
    tracing: {
      lambda: true,
      apiGateway: true,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["codedeploy:*"],
        Resource: ["*"],
      },
    ],
    logs: {
      restApi: true,
    },
  },
  // import the function via paths
  functions: {
    auth,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    generateUploadUrl,
    hello,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      RequestBodyValidator: {
        Type: "AWS::ApiGateway::RequestValidator",
        Properties: {
          Name: "request-body-validator",
          RestApiId: {
            Ref: "ApiGatewayRestApi",
          },
          ValidateRequestBody: true,
          ValidateRequestParameters: false,
        },
      },
      TodosTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.TODOS_TABLE}",
          AttributeDefinitions: [
            { AttributeName: "todoId", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "createdAt", AttributeType: "S" },
          ],
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "todoId", KeyType: "RANGE" },
          ],
          LocalSecondaryIndexes: [
            {
              IndexName: "${self:provider.environment.TODOS_CREATED_AT_INDEX}",
              KeySchema: [
                {
                  AttributeName: "userId",
                  KeyType: "HASH",
                },
                {
                  AttributeName: "createdAt",
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.ATTACHMENT_S3_BUCKET}",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                MaxAge: 3000,
              },
            ],
          },
        },
      },
      BucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: { Ref: "AttachmentsBucket" },
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "PublicReadForGetBucketObjects",
                Action: "s3:GetObject",
                Effect: "Allow",
                Resource:
                  "arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*",
                Principal: "*",
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
