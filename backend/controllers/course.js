const { MoreThan, LessThanOrEqual, IsNull, In } = require("typeorm");
const { appError, appSuccess } = require("../utils/responseUtils");
const {
  isValidStringArr,
  isValidUUID,
  isValidUrl,
} = require("../utils/validUtils");
const { getUserCredit } = require("../server/user");
const { getCourseBooking } = require("../server/course");
const { courseBookingRepo, courseRepo } = require("../db/repositories");
const {
  INPUT_ERR,
  COURSE_NOT_FOUND_ERR,
  ID_ERR,
  MAX_PARTICIPANTS_ERR,
  NOT_POINT_ERR,
  HAS_BOOKING_ERR,
} = require("../constants/errorMessages");

const courseController = {
  async getCourses(req, res, next) {
    const courses = await courseRepo.find({
      where: {
        user_id: req.user.id,
      },
      order: {
        start_at: "ASC",
      },
    });

    const participantCounts = new Map();
    if (courses.length > 0) {
      const activeBookings = await courseBookingRepo.find({
        where: {
          course_id: In(courses.map((course) => course.id)),
          cancelled_at: IsNull(),
        },
        select: {
          course_id: true,
        },
      });

      activeBookings.forEach(({ course_id }) => {
        participantCounts.set(
          course_id,
          (participantCounts.get(course_id) || 0) + 1,
        );
      });
    }

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
        participants: participantCounts.get(c.id) || 0, //報名人數
      };
    }); // 處理status

    res.status(200).json(appSuccess(data));
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
      !isValidStringArr([
        skill_id,
        name,
        description,
        start_at,
        end_at,
        meeting_url,
      ]) ||
      !isValidUUID(skill_id) ||
      !Number.isInteger(max_participants) ||
      max_participants < 0 ||
      !isValidUrl(meeting_url)
    )
      return next(appError(400, INPUT_ERR));

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
    res.status(201).json(appSuccess({ course }));
  }, // 教練開設新課程
  async getCourseDetail(req, res, next) {
    // 錯誤驗證:無課程id->欄位未填寫正確
    const { courseId } = req.params;
    if (!isValidUUID(courseId)) return next(appError(400, INPUT_ERR));
    const course = await courseRepo.findOne({
      where: { id: courseId },
      relations: { skill: true },
    });
    // 錯誤驗證:查無課程、開課者非登入者->課程不存在
    if (!course || course.user_id !== req.user.id)
      return next(appError(400, COURSE_NOT_FOUND_ERR));

    // 成功回 200，data 是完整課程資料，需含 skill_name 與 skill_id
    res
      .status(200)
      .json(appSuccess({ ...course, skill_name: course.skill.name }));
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
      !isValidStringArr([
        skill_id,
        name,
        description,
        start_at,
        end_at,
        meeting_url,
      ]) ||
      !isValidUUID(skill_id) ||
      !isValidUUID(courseId) ||
      !Number.isInteger(max_participants) ||
      max_participants < 0 ||
      !isValidUrl(meeting_url)
    )
      return next(appError(400, INPUT_ERR));

    const course = await courseRepo.findOneBy({ id: courseId });
    // 錯誤驗證:查無課程、開課者非登入者->課程不存在
    if (!course || course.user_id !== req.user.id)
      return next(appError(400, COURSE_NOT_FOUND_ERR));

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
    res.status(200).json(
      appSuccess({
        course: {
          ...updateCourse,
          skill_name: updateCourse.skill.name,
        },
      }),
    );
  }, // 更新課程資訊
  async getAllCourses(req, res, next) {
    const now = new Date().toISOString();
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
    res.status(200).json(appSuccess(data));
  }, // 取得所有課程
  async postCourses(req, res, next) {
    const { courseId } = req.params;
    if (!isValidUUID(courseId)) return next(appError(400, INPUT_ERR));
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) return next(appError(400, ID_ERR));

    const courseBooking = await getCourseBooking(courseId);

    const hasBooking = courseBooking.find((b) => b.user_id === req.user.id);
    if (hasBooking) return next(appError(400, HAS_BOOKING_ERR));
    const userBooking = await courseBookingRepo.find({
      where: { user_id: req.user.id, cancelled_at: IsNull() },
    });

    const userPurchase = await getUserCredit(req.user.id);
    if (userPurchase.userPoint - userBooking.length <= 0)
      return next(appError(400, NOT_POINT_ERR));
    const booking = courseBooking.filter((b) => !b.cancelled_at);
    if (booking.length >= course.max_participants)
      return next(appError(400, MAX_PARTICIPANTS_ERR));
    await courseBookingRepo.save({
      user_id: req.user.id,
      course_id: courseId,
    });
    res.status(201).json(appSuccess(null));
  }, //user報名課程
  async deleteCourses(req, res, next) {
    const { courseId } = req.params;
    if (!isValidUUID(courseId)) return next(appError(400, ID_ERR));
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!course) return next(appError(400, ID_ERR));

    const courseBooking = await courseBookingRepo.findBy({
      course_id: courseId,
    });
    const hasBooking = courseBooking.find((b) => b.user_id === req.user.id);
    if (!hasBooking || hasBooking.cancelled_at)
      return next(appError(400, ID_ERR));
    await courseBookingRepo.update(
      { id: hasBooking.id },
      {
        cancelled_at: new Date(),
      },
    );
    res.status(200).json(appSuccess(null));
  }, // 使用者取消預約
};

module.exports = courseController;
