const AWS = require('aws-sdk');
const cuid = require('cuid');

const s3 = new AWS.S3({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY'
});

const params = {
  Bucket: 'BUCKET_NAME',
  Key: 'video.mp4'
};

console.log('creating multipart');

s3.createMultipartUpload(params).promise().then(multipart_upload => {
  params.UploadId = multipart_upload.UploadId;
  console.log(`created multipart for ${params}`);

  const parts = 2;

  const promises = [...Array(parts).keys()]
    .map(partNo => s3.getSignedUrlPromise('uploadPart', {
      ...params,
      PartNumber: partNo + 1
    }));

  return Promise.all(promises).then(res => {
    const urls = res.reduce((map, part, index) => {
      map[index + 1] = part;
      return map;
    }, {});
    console.log(urls);
  });
}).catch(console.log);
