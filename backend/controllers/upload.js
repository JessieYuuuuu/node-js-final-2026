const crypto = require("node:crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require("../config");
const { appError, appSuccess } = require("../utils/responseUtils");
const { UPLOAD_FILE_REQUIRED_ERR } = require("../constants/errorMessages");

const uploadController = {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) return next(appError(400, UPLOAD_FILE_REQUIRED_ERR));

      const accountId = config.get("r2.accountId");
      const accessKeyId = config.get("r2.accessKeyId");
      const secretAccessKey = config.get("r2.secretAccessKey");
      const bucketName = config.get("r2.bucketName");
      const publicBaseUrl = config.get("r2.publicBaseUrl");
      const r2Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`, //連線r2的端點
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const extension = req.file.mimetype === "image/png" ? "png" : "jpg";
      const objectKey = `images/${req.user.id}/${crypto.randomUUID()}.${extension}`; //產生上傳路徑:/images/user_id/隨機id.副檔名

      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );

      const image_url = `${publicBaseUrl.replace(/\/$/, "")}/${objectKey}`; //回傳可預覽的圖片網址

      return res.status(200).json(
        appSuccess({
          image_url,
        }),
      );
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = uploadController;
