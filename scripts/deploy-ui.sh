#!/usr/bin/env bash
set -e

# Build the Vite app (outputs to stacks/frontend/dist)
pnpm ui build

# Get bucket name from the deployed SAM stack
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name QuizGeneratorApp \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

if [ -z "$BUCKET" ] || [ "$BUCKET" == "None" ]; then
  echo "Error: Could not get FrontendBucketName from stack QuizGeneratorApp."
  echo "Run 'sam build' and 'sam deploy' first."
  exit 1
fi

# Sync Vite build output to S3
aws s3 sync stacks/frontend/dist "s3://$BUCKET" --delete

echo "Deployed UI to s3://$BUCKET"
echo "Website URL: $(aws cloudformation describe-stacks --stack-name QuizGeneratorApp --query "Stacks[0].Outputs[?OutputKey=='FrontendWebsiteUrl'].OutputValue" --output text)"
