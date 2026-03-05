#!/usr/bin/env bash
set -e

# Build the Vite app (outputs to stacks/frontend/dist)
pnpm ui build

# Get stack outputs
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name QuizGeneratorApp \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

if [ -z "$BUCKET" ] || [ "$BUCKET" == "None" ]; then
  echo "Error: Could not get FrontendBucketName from stack QuizGeneratorApp."
  echo "Run 'sam build' and 'sam deploy' first."
  exit 1
fi

API_BASE_URL=$(aws cloudformation describe-stacks \
  --stack-name QuizGeneratorApp \
  --query "Stacks[0].Outputs[?OutputKey=='ApiBaseUrl'].OutputValue" \
  --output text)

if [ -z "$API_BASE_URL" ] || [ "$API_BASE_URL" == "None" ]; then
  echo "Error: Could not get ApiBaseUrl from stack QuizGeneratorApp."
  exit 1
fi

# Write runtime config so the browser knows where the API lives
echo "{\"apiBaseUrl\":\"$API_BASE_URL\"}" > stacks/frontend/dist/config.json

# Sync Vite build output to S3
aws s3 sync stacks/frontend/dist "s3://$BUCKET" --delete

WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name QuizGeneratorApp \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteUrl'].OutputValue" \
  --output text)

echo "Deployed UI to s3://$BUCKET"
echo "Website URL: $WEBSITE_URL"
