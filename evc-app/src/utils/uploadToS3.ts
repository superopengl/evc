import { Readable } from 'stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { assert } from './assert';
import { getAwsClientConfig } from './awsConfig';

let s3Client: S3Client | undefined;

/**
 * v2 built a fresh `new aws.S3()` per call, which was cheap because the v2 SDK shared one global
 * HTTP agent. v3 clients own their agent, so the client is cached instead of rebuilt per request.
 */
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client(getAwsClientConfig());
  }
  return s3Client;
}

function getDefaultConfig(id, name) {
  const bucketName = process.env.EVC_S3_BUCKET;
  const prefix = process.env.EVC_S3_FILE_PREFIX;
  const key = `${prefix}/${id}/${name}`;
  assert(prefix && id, 404, `image path cannot be composed '${bucketName}/${key}'`);
  return {
    Bucket: bucketName,
    Key: key,
  };
}

export async function uploadToS3(id, name, data): Promise<string> {
  // lib-storage's Upload is the v3 equivalent of s3.upload(): PutObjectCommand alone would not
  // give us back a Location, which the File entity stores.
  const upload = new Upload({
    client: getS3Client(),
    params: {
      ...getDefaultConfig(id, name),
      Body: data,
    },
  });

  const resp = await upload.done();

  // return the S3's path to the image
  return (resp as { Location?: string }).Location;
}

export async function getS3ObjectStream(id, name): Promise<Readable> {
  // v2 returned a stream synchronously via createReadStream(); in v3 the body arrives with the
  // response, so this is async now and callers must await it.
  const resp = await getS3Client().send(new GetObjectCommand(getDefaultConfig(id, name)));
  return resp.Body as Readable;
}
