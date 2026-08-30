const router = require("express").Router();
const userController = require("../controllers/user.js");
const isAuth = require("../middlewares/isAuth"); // token驗證

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/profile", isAuth, userController.getProfile);
router.put("/profile", isAuth, userController.putProfile);
router.put("/password", isAuth, userController.putPassword);
// // TODO M5 取得本人的購買紀錄
// router.get("/credit-package", isAuth, userController.getProfile);
// // TODO M5 取得本人的課表與剩餘堂數
// router.get("/courses", isAuth, userController.getProfile);
module.exports = router;
