const router = require("express").Router();
const publicCoachController = require("../controllers/publicCoach.js");

// 取得公開教練列表
router.get("/", publicCoachController.getCoachs);
// 取得單一教練詳細資料
router.get("/:coachId", publicCoachController.getCoach);
// 取得單一教練的課程列表
router.get("/:coachId/courses", publicCoachController.getCoachsCourses);

module.exports = router;
