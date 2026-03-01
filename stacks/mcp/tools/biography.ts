import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const getBiography = async (dogName: string): Promise<string> => {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.BIOGRAPHIES_BUCKET!,
      Key: `biographies/${dogName}.txt`,
    }),
  );
  const text = await response.Body!.transformToString('utf-8');
  console.log(`[get_biography] Loaded ${text.length} chars for ${dogName}`);
  return text;
};
