const uuid = require('uuid'); 
const aws = require('aws-sdk');

exports.generator = async (event) => {

  const key = `${event.queryStringParameters.fileName}.${event.queryStringParameters.key}`;
  const s3 = new aws.S3();

  const putParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: event.queryStringParameters.contentType,
    Expires: 30,
  };

  const getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: 60,
  };

  let presignedUrl;

  try {
    switch (event.queryStringParameters.operationType) {
      case 'putObject':
        presignedUrl = await s3.getSignedUrlPromise('putObject', putParams);
        break;
      case 'getObject':
        presignedUrl = await s3.getSignedUrlPromise('getObject', getParams);
        break;
    }
  } catch (error) {
    console.error('Não foi possível gerar a URL pré assinada', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao gerar a URL pré assinada' })
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
