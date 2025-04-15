# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## docker file

```shell
docker buildx build --platform linux/arm64 --provenance=false -t docker-deploy:test .
docker run --platform linux/arm64 -p 9000:8080 docker-deploy:test
```

```shell
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

## docker 로그인, 빌드 후 private repository 에 push

```
aws ecr get-login-password --region <region> --profile <profile_name> | docker login --username AWS --password-stdin <private_repository_id>

docker buildx build --platform linux/arm64 -t <repository_name> .

docker tag <repository_name>:latest <ecr_url>/<repository_name>:latest

docker push <ecr_url>/<repository_name>:latest
```