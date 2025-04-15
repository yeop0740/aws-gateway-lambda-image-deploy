FROM public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /usr/app
COPY package.json lambda/* tsconfig.json .env ./
RUN npm install
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/* /usr/app/.env /usr/app/*.json ./
RUN npm install --production
CMD ["auth.handler"]
