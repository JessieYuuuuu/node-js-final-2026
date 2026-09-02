// 驗證上傳檔案是否為指定格式、大小是否相符，如果都符合規範再進入下一步驟進行上傳
const multer = require("multer");
const { appError } = require("../utils/responseUtils");
const { UPLOAD_FILE_TYPE_ERR, UPLOAD_ERR, UPLOAD_ERROR_MESSAGES } = require("../constants/errorMessages");

const allowedMimeTypes = ["image/jpeg", "image/png"];

const multerUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },

  fileFilter(req, file, callback) {
    if (!allowedMimeTypes.includes(file.mimetype))
      return callback(appError(400, UPLOAD_FILE_TYPE_ERR));
    callback(null, true);
  },
});

const single = (fieldName) => {
  const multerMiddleware = multerUpload.single(fieldName);

  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();
      if (!(err instanceof multer.MulterError)) return next(err);
      return next(appError(400, UPLOAD_ERROR_MESSAGES[err.code] || UPLOAD_ERR));
    });
  };
};

module.exports = single;
