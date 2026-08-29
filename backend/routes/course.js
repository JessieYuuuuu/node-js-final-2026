const router = require("express").Router();
const courseController = require("../controllers/Course.js");
const isAuth = require("../middlewares/isAuth"); // token驗證
const isCoach = require("../middlewares/isCoach"); // 教練驗證

// 取得登入教練所有課程(驗登入+驗教練)
router.get("/", isAuth, isCoach, courseController.getCourses);
// 教練開新課(驗登入+驗教練)
router.post("/", isAuth, isCoach, courseController.createCourse);
// 取得單一課程詳情(驗登入)
router.get("/:courseId", isAuth, courseController.getCourseDetail);
// 更新課程(驗登入)
router.put("/:courseId", isAuth, courseController.updateCourse);

module.exports = router;
