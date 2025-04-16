import * as cdk from "aws-cdk-lib";
import { aws_ecr } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { TagMutability } from "aws-cdk-lib/aws-ecr";

export class PaymentAuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const paymentAuthRepository = new aws_ecr.Repository(
      this,
      "payment-auth-lambda-repository",
      {
        repositoryName: "payment-auth-lambda-repository",
        imageTagMutability: TagMutability.MUTABLE,
        imageScanOnPush: true,
      }
    );

    const paymentAuthFunction = new lambda.Function(
      this,
      "payment-auth-lambda",
      {
        functionName: "payment-auth-lambda",
        runtime: lambda.Runtime.FROM_IMAGE,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 1770,
        timeout: cdk.Duration.seconds(20),
        code: lambda.Code.fromEcrImage(paymentAuthRepository),
        handler: lambda.Handler.FROM_IMAGE,
      }
    );

    paymentAuthRepository.grantRead(paymentAuthFunction);
    paymentAuthRepository.grantPull(paymentAuthFunction);

    // Define the API Gateway resource
    const paymentAuthApi = new HttpApi(this, "payment-auth-http-api-gateway", {
      apiName: "payment-auth-api-gateway",
      description: "payment auth 테스트용 http api gateway 입니다.",
    });

    const paymentAuthLambdaIntegration = new HttpLambdaIntegration(
      "payment-auth-lambda-integration",
      paymentAuthFunction
    );

    paymentAuthApi.addRoutes({
      path: "/auth",
      methods: [HttpMethod.GET],
      integration: paymentAuthLambdaIntegration,
    });
  }
}
