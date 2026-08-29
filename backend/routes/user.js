const router = require("express").Router();
const userController = require("../controllers/user.js");
const isAuth = require("../middlewares/isAuth"); // token驗證

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/profile", isAuth, userController.getProfile);
router.put("/profile", isAuth, userController.putProfile);
router.put("/password", isAuth, userController.putPassword);

module.exports = router;
