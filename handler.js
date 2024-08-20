const uuid = require('uuid');
const aws = require('aws-sdk');

exports.generator = async (event) => {

  const key = `${uuid.v4()}.${event.queryStringParameters.key}`;
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: event.queryStringParameters.contentType,
    Expires: 30,
  };

  let presignedUrl;

  try {
    presignedUrl = await s3.getSignedUrlPromise('putObject', params);
  } catch (error) {
    console.error('Não foi possível gerar a URL pré assinada', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Falha ao gerar a URL pré assinada'})
    }
  };

  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      presignedUrl, key
    })
  };
};
