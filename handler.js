const aws = require("aws-sdk");

const OBJECT_GET_EXPIRES_TTL = 300;
const OBJECT_PUT_EXPIRES_TTL = 30;
const ERROR_STATUS_CODE = 500;
const SUCCESS_STATUS_CODE = 200;

exports.generator = async (event) => {
  const key = `${event.queryStringParameters.fileName}.${event.queryStringParameters.key}`;
  const s3 = new aws.S3();

  const putParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: event.queryStringParameters.contentType,
    BucketKeyEnabled: true,
    Expires: OBJECT_PUT_EXPIRES_TTL,
  };

  const getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: OBJECT_GET_EXPIRES_TTL,
  };

  let presignedUrl;

  try {
    switch (event.queryStringParameters.operationType) {
      case "putObject":
        presignedUrl = await s3.getSignedUrlPromise("putObject", putParams);
        break;
      case "getObject":
        presignedUrl = await s3.getSignedUrlPromise("getObject", getParams);
        break;
    }
  } catch (error) {
    console.error("Não foi possível gerar a URL pré assinada", error);
    return {
      statusCode: ERROR_STATUS_CODE,
      body: JSON.stringify({ error: "Falha ao gerar a URL pré assinada" }),
    };
  }

  console.log(event);

  return {
    statusCode: SUCCESS_STATUS_CODE,
    body: JSON.stringify({
      presignedUrl,
      key,
    }),
  };
};
