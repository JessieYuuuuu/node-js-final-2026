// 是否有教練權限
const { appError } = require("../utils/responseUtils");
const { isValidCoach } = require("../utils/validUtils");
const isCoach = async (req, res, next) =>
  isValidCoach(req.user.role)
    ? next()
    : next(appError(401, "使用者尚未成為教練"));
module.exports = isCoach;
