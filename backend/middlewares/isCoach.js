// 是否有教練權限
const appError = require("../utils/appError");
const isCoach = async (req, res, next) =>
  req.user.role === "COACH"
    ? next()
    : next(appError(401, "使用者尚未成為教練"));
module.exports = isCoach;
