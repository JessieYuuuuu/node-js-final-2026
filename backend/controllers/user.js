const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");
const config = require("../config/index");
const appError = require("../utils/appError");
const { isValidString, isValidPassword } = require("../utils/validUtils");

// 規定提示文字
const PW_ERR = "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字";
const EMAIL_ERR = "Email 已被使用";
const NOT_FOUND_USER_ERR = "使用者不存在或密碼輸入錯誤";
const NEW_PASSWORD_SAME_AS_OLD = "新密碼不能與舊密碼相同";
const PASSWORD_CONFIRMATION_MISMATCH = "兩次輸入的新密碼不一致";
const INPUT_ERR = "欄位未填寫正確";

const usersController = {
  async signup(req, res, next) {
    const { name, email, password } = req.body;
    // name、email、password 任一缺漏或為空字串
    if (
      !isValidString(name) ||
      !isValidString(email) ||
      !isValidString(password)
    )
      return next(appError(400, INPUT_ERR));
    //  密碼不符合規則
    if (!isValidPassword(password)) return next(appError(400, PW_ERR));
    const userRepo = dataSource.getRepository("User");
    const inputEmail = email.trim().toLowerCase();
    const inputName = name.trim();
    // Email 不可重複，已被註冊過回 409
    const existing = await userRepo.findOneBy({
      email: inputEmail,
    });
    if (existing) return next(appError(409, EMAIL_ERR));
    const hashed = await bcrypt.hash(password, 10);
    const nUser = await userRepo.save({
      name: inputName,
      email: inputEmail,
      password: hashed,
      role: "USER",
    });
    // 成功回201，資料只回 user 的 id（uuid 字串）與 name
    res.status(201).json({
      status: "success",
      data: { user: { id: nUser.id, name: nUser.name } },
    });
  }, // 註冊
  async login(req, res, next) {
    const { email, password } = req.body;
    // 登入時也會先檢查欄位與密碼規則
    if (!isValidString(email) || !isValidString(password))
      return next(appError(400, INPUT_ERR));
    if (!isValidPassword(password)) return next(appError(400, PW_ERR));
    const userRepo = dataSource.getRepository("User");
    const inputEmail = email.trim().toLowerCase();
    // 「帳號不存在」與「密碼錯誤」共用同一句 400 訊息「使用者不存在或密碼輸入錯誤」
    const user = await userRepo.findOneBy({
      email: inputEmail,
    });
    if (!user) return next(appError(404, NOT_FOUND_USER_ERR));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(appError(401, NOT_FOUND_USER_ERR));
    // JWT payload 格式：解開 token 後必須包含 { id, role, exp } 三個欄位
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.get("secret.jwtSecret"),
      { expiresIn: config.get("secret.jwtExpiresDay") },
    );
    // 登入成功要201，並回token
    res.status(201).json({
      status: "success",
      data: { token, user: { name: user.name } },
    });
  }, // 登入
  async getProfile(req, res, next) {
    res.status(200).json({
      status: "success",
      data: { user: { name: req.user.name, email: req.user.email } },
    });
  }, // 取得使用者資料(一開始是使用資料庫查使用者回傳，後來看助教直播直接用驗證完token的req資料，所以改成這一版)
  async putProfile(req, res, next) {
    const { name } = req.body;
    // name 缺漏或為空字串
    if (!isValidString(name)) return next(appError(400, INPUT_ERR));
    const inputName = name.trim();
    const userRepo = dataSource.getRepository("User");
    const matchUser = await userRepo.findOneBy({ id: req.user.id });
    //  新名稱與目前名稱相同
    if (matchUser.name === inputName)
      return next(appError(400, "使用者名稱未變更"));
    const updateUser = await userRepo.save({
      ...matchUser,
      name: inputName,
    });
    // 更新沒有生效
    if (updateUser.name !== inputName)
      return next(appError(400, "更新使用者資料失敗"));
    // 成功回傳新名稱
    res.status(200).json({
      status: "success",
      data: { user: { name: updateUser.name } },
    });
  }, // 更新使用者名稱
  async putPassword(req, res, next) {
    const { password, new_password, confirm_new_password } = req.body;
    //三欄任一缺漏／空字串
    if (
      !isValidString(password) ||
      !isValidString(new_password) ||
      !isValidString(confirm_new_password)
    )
      return next(appError(400, INPUT_ERR));
    // 三欄任一不符密碼規則
    if (
      !isValidPassword(password) ||
      !isValidPassword(new_password) ||
      !isValidPassword(confirm_new_password)
    )
      return next(appError(400, PW_ERR));
    const userRepo = dataSource.getRepository("User");
    const matchUser = await userRepo.findOneBy({ id: req.user.id });
    const isMatch = await bcrypt.compare(password, matchUser.password);
    // 舊密碼比對錯誤
    if (!isMatch) return next(appError(400, "密碼輸入錯誤"));
    const isMatch_New_password = await bcrypt.compare(
      new_password,
      matchUser.password,
    );
    // 新密碼與舊密碼相同
    if (isMatch_New_password)
      return next(appError(400, NEW_PASSWORD_SAME_AS_OLD));
    // 新密碼與確認新密碼不一致
    if (new_password !== confirm_new_password)
      return next(appError(400, PASSWORD_CONFIRMATION_MISMATCH));
    const hashed = await bcrypt.hash(new_password, 10);
    // 更新密碼
    await userRepo.save({
      ...matchUser,
      password: hashed,
    });
    res.status(200).json({
      status: "success",
      data: null,
    });
  }, // 更新密碼
};

module.exports = usersController;
