const { dataSource } = require("../db/data-source");
const { MoreThan, LessThanOrEqual, IsNull } = require("typeorm");
const appError = require("../utils/appError");
const { isValidString, isValidUUID } = require("../utils/validUtils");
// 規定提示文字
const INPUT_ERR = "欄位未填寫正確";
const NOT_FOUND_COURSE_ERR = "課程不存在";
const ID_ERR = "ID錯誤";

const courseController = {
  async getCourses(req, res, next) {
    const courseRepo = dataSource.getRepository("Course");
    const courses = await courseRepo.find({
      where: {
        user_id: req.user.id,
      },
      order: {
        start_at: "ASC",
      },
    });

    const now = new Date();
    const data = courses.map((c) => {
      const sAt = new Date(c.start_at);
      const eAt = new Date(c.end_at);
      let status;
      if (now < sAt) status = "尚未開始";
      else if (now <= eAt) status = "進行中";
      else status = "已結束";
      return {
        id: c.id,
        name: c.name,
        status,
        start_at: c.start_at,
        end_at: c.end_at,
        max_participants: c.max_participants,
        meeting_url: c.meeting_url,
        // TODO:補報名資料整理
        participants: 0, //報名人數先為0，目前是M3報名在M5
      };
    }); // 處理status

    res.status(200).json({
      status: "success",
      data,
    });
  }, // 取得特定教練的全部課程
  async createCourse(req, res, next) {
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    /**
     * 錯誤驗證(欄位未填寫正確)
     * meeting_url 必須以 https 開頭、全部欄位都是必填
     *  max_participants 必須是「數字型別」的 0 以上整數——送字串 "10"
     * start_at／end_at 收 UTC ISO 8601 字串（例 2026-08-20T10:00:00Z），原樣存入、原樣吐回
     */
    if (
      !isValidString(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidString(start_at) ||
      !isValidString(end_at) ||
      !isValidString(meeting_url) ||
      !Number.isInteger(max_participants) ||
      max_participants > 10 ||
      !meeting_url.startsWith("https://")
    )
      return next(appError(400, INPUT_ERR));

    const courseRepo = dataSource.getRepository("Course");
    const course = courseRepo.create({
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
      // 開課的教練就是 token 裡的本人
      user_id: req.user.id,
    });

    await courseRepo.save(course);
    // 成功回 201（不是 200），data.course 是完整課程物件，需含status
    res.status(201).json({
      status: "success",
      data: {
        course,
      },
    });
  }, // 教練開設新課程
  async getCourseDetail(req, res, next) {
    // 錯誤驗證:無課程id->欄位未填寫正確
    const { courseId } = req.params;
    if (!isValidString(courseId)) return next(appError(400, INPUT_ERR));
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    // 錯誤驗證:查無課程、開課者非登入者->課程不存在
    if (!course || course.user_id !== req.user.id)
      return next(appError(400, NOT_FOUND_COURSE_ERR));

    // 成功回 200，data 是完整課程資料，需含 skill_name 與 skill_id
    res.status(200).json({
      status: "success",
      data: {
        ...course,
      },
    });
  }, // 取得課程詳細資訊
  async updateCourse(req, res, next) {
    const { courseId } = req.params;
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    /**
     * 錯誤驗證(欄位未填寫正確)
     * meeting_url 必須以 https 開頭、全部欄位都是必填
     *  max_participants 必須是「數字型別」的 0 以上整數——送字串 "10"
     * start_at／end_at 收 UTC ISO 8601 字串（例 2026-08-20T10:00:00Z），原樣存入、原樣吐回
     */
    if (
      !isValidString(skill_id) ||
      !isValidString(name) ||
      !isValidString(description) ||
      !isValidString(start_at) ||
      !isValidString(end_at) ||
      !isValidString(meeting_url) ||
      !Number.isInteger(max_participants) ||
      max_participants < 0 ||
      !meeting_url.startsWith("https://")
    )
      return next(appError(400, INPUT_ERR));

    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    // 錯誤驗證:查無課程、開課者非登入者->課程不存在
    if (!course || course.user_id !== req.user.id)
      return next(appError(400, NOT_FOUND_COURSE_ERR));

    await courseRepo.update(
      {
        id: courseId,
        user_id: req.user.id,
      },
      {
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      },
    );
    const updateCourse = await courseRepo.findOne({
      where: {
        id: courseId,
      },
      relations: {
        skill: true,
      },
    });
    // 成功回 200，data.course 是完整課程物件
    res.status(200).json({
      status: "success",
      data: {
        ...updateCourse,
        skill_name: updateCourse.skill.name,
      },
    });
  }, // 更新課程資訊
  async getAllCourses(req, res, next) {
    const now = new Date().toISOString();
    const courseRepo = dataSource.getRepository("Course");
    const courses = await courseRepo.find({
      where: {
        start_at: LessThanOrEqual(now),
        end_at: MoreThan(now),
      },
      order: {
        start_at: "ASC",
      },
      relations: {
        skill: true,
        user: true,
      },
    });
    const data = courses.map((c) => {
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        start_at: c.start_at,
        end_at: c.end_at,
        max_participants: c.max_participants,
        coach_name: c.user.name,
        skill_name: c.skill.name,
      };
    });
    res.status(200).json({
      status: "success",
      data,
    });
  },
  async postCourses(req, res, next) {
    const { courseId } = req.params;
    if (!isValidString(courseId) || !isValidUUID(courseId))
      return next(appError(400, INPUT_ERR));
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) return next(appError(400, NOT_FOUND_COURSE_ERR));

    const bookingRepo = dataSource.getRepository("CourseBooking");
    const courseBooking = await bookingRepo.findBy({ course_id: courseId });
    const hasBooking = courseBooking.find((b) => b.user_id === req.user.id);
    if (hasBooking) return next(appError(400, "已經報名過此課程"));
    const userBooking = await bookingRepo.find({
      where: { user_id: req.user.id, cancelled_at: IsNull() },
    });
    const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
    const userBuy = await creditPurchaseRepo.findBy({
      user_id: req.user.id,
    });
    const userPoint = userBuy.reduce((acc, p) => (acc += p.purchase_credit), 0);
    if (userPoint - userBooking.length <= 0)
      return next(appError(400, "已無可使用堂數"));
    const booking = courseBooking.filter((b) => !b.cancelled_at);
    if (booking.length >= course.max_participants)
      return next(appError(400, "已達最大參加人數，無法參加"));
    await bookingRepo.save({
      user_id: req.user.id,
      course_id: courseId,
    });
    res.status(201).json({
      status: "success",
      data: null,
    });
  }, //user報名課程
  async deleteCourses(req, res, next) {
    const { courseId } = req.params;
    if (!isValidString(courseId) || !isValidUUID(courseId))
      return next(appError(400, ID_ERR));
    const courseRepo = dataSource.getRepository("Course");
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) return next(appError(400, ID_ERR));

    const bookingRepo = dataSource.getRepository("CourseBooking");
    const courseBooking = await bookingRepo.findBy({ course_id: courseId });
    const hasBooking = courseBooking.find((b) => b.user_id === req.user.id);
    if (!hasBooking || hasBooking.cancelled_at)
      return next(appError(400, ID_ERR));
    await bookingRepo.update(
      { id: hasBooking.id },
      {
        cancelled_at: new Date(),
      },
    );
    res.status(200).json({
      status: "success",
      data: null,
    });
  }, // 使用者取消預約
};

module.exports = courseController;
