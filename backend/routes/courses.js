const router = require("express").Router();
const publicCourseController = require("../controllers/publicCourse.js");

// 取得公開課程列表
router.get("/", publicCourseController.getCourses);

// // TODO M5 報名課程
// router.post("/:courseId", publicCourseController.postCourses);
// // TODO M5 取消課程報名
// router.delete("/:courseId", publicCourseController.deleteCourses);

module.exports = router;
