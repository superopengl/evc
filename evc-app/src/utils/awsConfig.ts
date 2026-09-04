import { assert } from './assert';

export type AwsClientConfig = {
  region: string;
  credentials?: { accessKeyId: string; secretAccessKey: string };
};

/**
 * The v2 SDK had a mutable global (`aws.config.update`). v3 has no global config - every client
 * takes its own - so this returns the shared settings instead of applying them as a side effect.
 * Falling through without credentials keeps the previous behaviour of letting the default
 * provider chain (task role in ECS) supply them.
 */
export function getAwsClientConfig(): AwsClientConfig {
  const { AWS_DEFAULT_REGION, EVC_AWS_ACCESS_KEY_ID, EVC_AWS_SECRET_ACCESS_KEY } = process.env;

  assert(AWS_DEFAULT_REGION, 500, 'AWS_DEFAULT_REGION is not specified');

  if (EVC_AWS_ACCESS_KEY_ID && EVC_AWS_SECRET_ACCESS_KEY) {
    return {
      region: AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: EVC_AWS_ACCESS_KEY_ID,
        secretAccessKey: EVC_AWS_SECRET_ACCESS_KEY,
      },
    };
  }

  console.log('AWS default config');
  return { region: AWS_DEFAULT_REGION };
}
