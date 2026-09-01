const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const { appError, appSuccess } = require("../utils/responseUtils");
const {
  isValidString,
  isValidPassword,
  isValidStringArr,
} = require("../utils/validUtils");
const { getUserCredit, getUserBooking } = require("../server/user");
const { userRepo, creditPurchaseRepo } = require("../db/repositories");
const {
  PW_ERR,
  EMAIL_ERR,
  LOGIN_USER_NOT_FOUND_ERR,
  NEW_PASSWORD_SAME_AS_OLD,
  PASSWORD_CONFIRMATION_MISMATCH,
  INPUT_ERR,
  USER_NAME_UNCHANGED_ERR,
  UPDATE_USER_FAILED_ERR,
  PASSWORD_INCORRECT_ERR,
} = require("../constants/errorMessages");

const usersController = {
  async signup(req, res, next) {
    const { name, email, password } = req.body;
    // name、email、password 任一缺漏或為空字串
    if (!isValidStringArr([name, email, password]))
      return next(appError(400, INPUT_ERR));
    //  密碼不符合規則
    if (!isValidPassword(password)) return next(appError(400, PW_ERR));
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
    res
      .status(201)
      .json(appSuccess({ user: { id: nUser.id, name: nUser.name } }));
  }, // 註冊
  async login(req, res, next) {
    const { email, password } = req.body;
    // 登入時也會先檢查欄位與密碼規則
    if (!isValidStringArr([email, password]))
      return next(appError(400, INPUT_ERR));
    if (!isValidPassword(password)) return next(appError(400, PW_ERR));
    const inputEmail = email.trim().toLowerCase();
    // 「帳號不存在」與「密碼錯誤」共用同一句 400 訊息「使用者不存在或密碼輸入錯誤」
    const user = await userRepo.findOneBy({
      email: inputEmail,
    });
    if (!user) return next(appError(400, LOGIN_USER_NOT_FOUND_ERR));
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(appError(400, LOGIN_USER_NOT_FOUND_ERR));
    // JWT payload 格式：解開 token 後必須包含 { id, role, exp } 三個欄位
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.get("secret.jwtSecret"),
      { expiresIn: config.get("secret.jwtExpiresDay") },
    );
    // 登入成功要201，並回token
    res.status(201).json(appSuccess({ token, user: { name: user.name } }));
  }, // 登入
  async getProfile(req, res, next) {
    res
      .status(200)
      .json(
        appSuccess({ user: { name: req.user.name, email: req.user.email } }),
      );
  }, // 取得使用者資料(一開始是使用資料庫查使用者回傳，後來看助教直播直接用驗證完token的req資料，所以改成這一版)
  async putProfile(req, res, next) {
    const { name } = req.body;
    // name 缺漏或為空字串
    if (!isValidString(name)) return next(appError(400, INPUT_ERR));
    const inputName = name.trim();
    const matchUser = await userRepo.findOneBy({ id: req.user.id });
    //  新名稱與目前名稱相同
    if (matchUser.name === inputName)
      return next(appError(400, USER_NAME_UNCHANGED_ERR));
    const updateUser = await userRepo.save({
      ...matchUser,
      name: inputName,
    });
    // 更新沒有生效
    if (updateUser.name !== inputName)
      return next(appError(400, UPDATE_USER_FAILED_ERR));
    // 成功回傳新名稱
    res.status(200).json(appSuccess({ user: { name: updateUser.name } }));
  }, // 更新使用者名稱
  async putPassword(req, res, next) {
    const { password, new_password, confirm_new_password } = req.body;
    //三欄任一缺漏／空字串
    if (!isValidStringArr([password, new_password, confirm_new_password]))
      return next(appError(400, INPUT_ERR));
    // 三欄任一不符密碼規則
    if (
      !isValidPassword(password) ||
      !isValidPassword(new_password) ||
      !isValidPassword(confirm_new_password)
    )
      return next(appError(400, PW_ERR));
    const matchUser = await userRepo.findOneBy({ id: req.user.id });
    const isMatch = await bcrypt.compare(password, matchUser.password);
    // 舊密碼比對錯誤
    if (!isMatch) return next(appError(400, PASSWORD_INCORRECT_ERR));
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
    res.status(200).json(appSuccess(null));
  }, // 更新密碼
  async getUserBuy(req, res, next) {
    const userBuy = await creditPurchaseRepo.find({
      where: { user_id: req.user.id },
      order: { purchase_at: "DESC" },
      relations: {
        creditPackage: true,
      },
    });
    const data = userBuy.map((p) => {
      return {
        name: p.creditPackage.name,
        purchased_credits: p.purchase_credit,
        price_paid: p.purchase_price,
        purchase_at: p.purchase_at,
      };
    });
    res.status(200).json(appSuccess(data));
  }, // 取得登入者的方案購買紀錄
  async getUserCredit(req, res, next) {
    const uid = req.user.id;
    const userHas = await getUserCredit(uid);
    const userBooking = await getUserBooking(uid, true);
    const userUsage = userBooking.filter((b) => !b.cancelled_at);
    const course_booking = userBooking.map((b) => {
      return {
        course_id: b.course_id,
        name: b.course.name,
        start_at: b.course.start_at,
        end_at: b.course.end_at,
        meeting_url: b.course.meeting_url,
        coach_name: b.course.user.name,
        cancelled_at: b.cancelled_at,
      };
    });
    res.status(200).json(
      appSuccess({
        credit_remain: userHas.userPoint - userUsage.length,
        credit_usage: userUsage.length,
        course_booking,
      }),
    );
  }, //取得登入者的課表與剩餘堂數
};

module.exports = usersController;
