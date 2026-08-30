const router = require("express").Router();
const coachController = require("../controllers/coach.js");

// 取得公開教練列表
router.get("/", coachController.getCoachs);
// 取得單一教練詳細資料
router.get("/:coachId", coachController.getCoach);
// 取得單一教練的課程列表
router.get("/:coachId/courses", coachController.getCoachsCourses);

module.exports = router;
