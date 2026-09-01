// 共用錯誤工具
const appError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
const appSuccess = (data) => ({
  status: "success",
  data,
});

module.exports = {
  appError,
  appSuccess,
};
