#!/bin/bash

# Initialize LocalStack with AWS resources
awslocal s3 mb s3://monorepo-storage
awslocal sqs create-queue --queue-name monorepo-queue
awslocal dynamodb create-table \
    --table-name monorepo-table \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST