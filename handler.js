const uuid = require("uuid");
const aws = require("aws-sdk");

exports.generator = async (event) => {
  const key = `${event.queryStringParameters.fileName}.${event.queryStringParameters.key}`;
  const kms = new aws.KMS();
  const s3 = new aws.S3({
    signatureVersion: "v4",
  });

  const putParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ServerSideEncryption: "aws:kms",
    SSEKMSKeyId: process.env.KMS_KEY_ID,
    ContentType: event.queryStringParameters.contentType,
    BucketKeyEnabled: true,
    Expires: 30,
  };

  const getParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Expires: 300,
  };

  let presignedUrl;

  try {
    switch (event.queryStringParameters.operationType) {
      case "putObject":
        presignedUrl = await s3.getSignedUrlPromise("putObject", putParams);
        await rotateCustomKey();
        break;
      case "getObject":
        presignedUrl = await s3.getSignedUrlPromise("getObject", getParams);
        break;
    }
  } catch (error) {
    console.error("Não foi possível gerar a URL pré assinada", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falha ao gerar a URL pré assinada" }),
    };
  }

  async function rotateCustomKey() {
    const params = {
      KeyId: process.env.KMS_KEY_ID,
    };

    try {
      await kms.enableKeyRotation(params).promise();
      console.log("Chave KMS rotacionada com sucesso.");
    } catch (error) {
      console.error("Erro ao rotacionar a chave KMS:", error);
      throw error;
    }
  }

  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      presignedUrl,
      key,
    }),
  };
};
