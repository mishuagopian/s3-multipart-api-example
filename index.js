const AWS = require('aws-sdk');
const cuid = require('cuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-west-2',
  useAccelerateEndpoint: true,
  signatureVersion: 'v4'
});

exports.handler = async (event) => {
  const parts = event.queryStringParameters && parseInt(event.queryStringParameters.parts);
  const filename = event.queryStringParameters && event.queryStringParameters.filename;

  if (!parts || parts <= 1 || !filename) {
    return {
      statusCode: 400,
      body: `Los parámetros parts y filename son requeridos. ${JSON.stringify(event)}`
    }
  }

  console.log(`parts: ${parts}`);
  console.log(`filename: ${filename}`);

  const params = {
    Bucket: process.env.BUCKET,
    Key: `uploads/activities/${cuid()}/${filename}`
  };

  console.log('creating multipart');

  const urls = await s3.createMultipartUpload(params).promise().then(multipart_upload => {
    params.UploadId = multipart_upload.UploadId;
    console.log(`created multipart for ${JSON.stringify(params)}`);

    const promises = [...Array(parts).keys()]
      .map(partNo => s3.getSignedUrlPromise('uploadPart', {
        ...params,
        PartNumber: partNo + 1
      }));

    console.log('created promises for signed urls');

    return Promise.all(promises).then(res => res.reduce((acum, url) => [...acum, url], []));
  });

  console.log(urls);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET"
    },
    body: JSON.stringify({ urls: urls, key: params.Key, id: params.UploadId })
  };
};

