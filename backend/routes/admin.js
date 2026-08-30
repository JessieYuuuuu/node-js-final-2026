const router = require("express").Router();
const courseController = require("../controllers/course.js");
const coachController = require("../controllers/coach.js");
const isAuth = require("../middlewares/isAuth");
const isCoach = require("../middlewares/isCoach");

router.get("/courses", isAuth, isCoach, courseController.getCourses);
router.post("/courses", isAuth, isCoach, courseController.createCourse);
router.get("/courses/:courseId", isAuth, courseController.getCourseDetail);
router.put("/courses/:courseId", isAuth, courseController.updateCourse);

router.get("/", isAuth, isCoach, coachController.getCoachInfo);
router.put("/", isAuth, isCoach, coachController.putCoachInfo);
router.post("/:userId", coachController.upgradeToCoach);

// // TODO M6 教練本人指定月分營收統計
// router.get("/revenue", isAuth, isCoach, coachController.getRevenue);
module.exports = router;
