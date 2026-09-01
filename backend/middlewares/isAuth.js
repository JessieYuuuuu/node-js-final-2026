// token驗證
const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");
const config = require("../config/index");
const { appError } = require("../utils/responseUtils");

const TOKEN_ERR = "無效的 token";
const TOKEN_EXPIRED_ERR = "Token 已過期";
const LOGIN_ERR = "請先登入";

const isAuth = async (req, res, next) => {
  try {
    // 取 token
    const authHeader = req.headers.authorization;
    // 沒帶 Authorization header、或格式不是 Bearer
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return next(appError(401, LOGIN_ERR));
    const token = authHeader.split(" ")[1];
    // 驗證token
    const decoded = jwt.verify(token, config.get("secret.jwtSecret"));
    // 用 decoded.id查user
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOneBy({ id: decoded.id });
    // token 無效
    if (!user) return next(appError(401, TOKEN_ERR));
    // 把user掛回去給後續流程使用
    req.user = user;
    next();
  } catch (err) {
    // token 已過期
    if (err.name === "TokenExpiredError")
      return next(appError(401, TOKEN_EXPIRED_ERR));
    return next(appError(401, TOKEN_ERR));
  }
};
module.exports = isAuth;
