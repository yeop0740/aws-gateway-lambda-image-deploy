import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";

export class PaymentAuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const paymentAuthImage = new ecr_assets.DockerImageAsset(
      this,
      "payment-auth-lambda-image",
      {
        assetName: "payment-auth-lambda-image",
        directory: "./",
        platform: Platform.LINUX_ARM64,
      }
    );

    const paymentAuthFunction = new lambda.Function(
      this,
      "payment-auth-lambda",
      {
        functionName: "payment-auth-lambda",
        runtime: lambda.Runtime.FROM_IMAGE,
        code: lambda.Code.fromEcrImage(paymentAuthImage.repository, {
          tagOrDigest: paymentAuthImage.imageTag,
        }),
        handler: lambda.Handler.FROM_IMAGE,
      }
    );

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
