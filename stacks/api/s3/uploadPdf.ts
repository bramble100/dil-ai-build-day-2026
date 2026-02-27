import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({});

/**
 * Uploads a PDF buffer to the uploads S3 bucket.
 * The object key encodes the quizId so uploaded files are traceable to their quiz.
 *
 * @param quizId - The UUID of the quiz being generated
 * @param pdfBuffer - Raw PDF bytes
 * @returns The S3 object key of the uploaded file
 */
export const uploadPdf = async (quizId: string, pdfBuffer: Buffer): Promise<string> => {
  const bucket = process.env.UPLOADS_BUCKET!;
  const key = `uploads/${quizId}.pdf`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
  });

  await client.send(command);

  console.log(`[uploadPdf] Uploaded PDF to s3://${bucket}/${key}`);

  return key;
};
