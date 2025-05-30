import { defineBackend, secret } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { storage } from './storage/resource';
import { generatePage } from './function/generatePage/resource';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

// Define the backend
const backend = defineBackend({
  auth,
  storage,
  generatePage
});

// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a new REST API
const generatePageApi = new RestApi(apiStack, "generatePageApi", {
  restApiName: "generatePageApi",
  deploy: true,
  deployOptions: {
    stageName: "main",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS, // Restrict this to domains you trust
    allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  },
});

// create a new Lambda integration
const lambdaIntegration = new LambdaIntegration(
  backend.generatePage.resources.lambda
);

// create a new resource path with IAM authorization
const itemsPath = generatePageApi.root.addResource("items", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

// add methods you would like to create to the resource path
itemsPath.addMethod("POST", lambdaIntegration);

// add a proxy resource path to the API
itemsPath.addProxy({
  anyMethod: true,
  defaultIntegration: lambdaIntegration,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(apiStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${generatePageApi.arnForExecuteApi("*", "/generatePage", "main")}`,
      ],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

console.log(`arn:aws:s3:::amplify-govukgemini-michaelbig-pagesbucket558571fd-lrckcztchcbs/generated-pages/*`);
console.log(`arn:aws:s3:::${secret('AMPLIFY_STORAGE_BUCKET_NAME')}/generated-pages/*`);

// create a new IAM policy to allow Lambda write access to the S3 bucket
const s3WritePolicy = new Policy(apiStack, "S3WritePolicy", {
  statements: [
    new PolicyStatement({
      actions: ["s3:PutObject"],
      resources: [
        // Only allow writing to the generated-pages/* prefix
        `arn:aws:s3:::${backend.storage.resources.bucket.bucketName}/generated-pages/*`
      ],
    }),
  ],
});

// attach the policy to the Lambda execution role (safe with optional chaining)
backend.generatePage.resources.lambda.role?.attachInlinePolicy(s3WritePolicy);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [generatePageApi.restApiName]: {
        endpoint: generatePageApi.url,
        region: Stack.of(generatePageApi).region,
        apiName: generatePageApi.restApiName,
      },
    },
  },
});
