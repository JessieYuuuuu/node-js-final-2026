const router = require("express").Router();
const coachController = require("../controllers/coach.js");
const isAuth = require("../middlewares/isAuth"); // token驗證
const isCoach = require("../middlewares/isCoach"); // 教練驗證

router.post("/:userId", coachController.upgradeToCoach);
router.get("/", isAuth, isCoach, coachController.getCoachInfo);
router.put("/", isAuth, isCoach, coachController.putCoachInfo);

module.exports = router;
