const router = require("express").Router();
const courseController = require("../controllers/course.js");
const isAuth = require("../middlewares/isAuth");

// 取得公開課程列表
router.get("/", courseController.getAllCourses);

// M5 報名課程
router.post("/:courseId", isAuth, courseController.postCourses);
// M5 取消課程報名
router.delete("/:courseId", isAuth, courseController.deleteCourses);

module.exports = router;
