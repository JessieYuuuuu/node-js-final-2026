// 共用錯誤工具
const appError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
module.exports = appError;
