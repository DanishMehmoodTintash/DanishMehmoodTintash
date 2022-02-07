/* eslint-disable */
const s3FolderUpload = require('s3-folder-upload');

const environment = process.env.REACT_APP_BUILD_ENV;

console.log('Environment:', environment.toUpperCase());

try {
  const { AWS } = require(`./config.${environment}.json`);

  console.log(AWS);

  const { accessKeyId } = AWS;
  const { secretAccessKey } = AWS;
  const { region } = AWS;
  const { bucket } = AWS;
  const { distributionId } = AWS;
  const directoryName = 'build';

  const credentials = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region,
    bucket: bucket,
  };

  // optional options to be passed as parameter to the method
  const options = {
    useFoldersForFileTypes: false,
    useIAMRoleCredentials: false,
    CacheControl: 'no-cache',
  };

  // optional cloudfront invalidation rule
  const invalidation = {
    awsDistributionId: distributionId,
    awsInvalidationPath: '/*',
  };

  s3FolderUpload(directoryName, credentials, options, invalidation);
} catch (error) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    `Config file missing for environment "${environment}". Create config.${environment}.json to continue.`
  );
}
