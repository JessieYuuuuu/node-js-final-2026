const { MoreThan } = require("typeorm");
const { dataSource } = require("../db/data-source");
const {
  isInteger,
  isValidString,
  isValidUUID,
} = require("../utils/validUtils");
const appError = require("../utils/appError");

// 規定提示文字
const INPUT_ERR = "欄位未填寫正確";
const NOT_FOUND_COACH_ERR = "找不到該教練";
const publicCoachController = {
  async getCoachs(req, res, next) {
    const { per, page } = req.query;
    if (!isInteger(Number(per)) || !isInteger(Number(page)))
      return next(appError(400, INPUT_ERR));
    const coachRepo = dataSource.getRepository("Coach");
    const coachs = await coachRepo.find({
      take: Number(per),
      skip: (Number(page) - 1) * Number(per),
      relations: {
        user: true,
      },
    });
    const data = coachs.map((c) => {
      return {
        id: c.id,
        user_id: c.user_id,
        name: c.user.name,
      };
    });
    res.status(200).json({
      status: "success",
      data,
    });
  }, // 取得全部教練列表
  async getCoach(req, res, next) {
    const { coachId } = req.params;
    if (!isValidString(coachId) || !isValidUUID(coachId))
      return next(appError(400, INPUT_ERR));
    const coachRepo = dataSource.getRepository("Coach");
    const matchCoach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      relations: {
        user: true,
        coachSkills: true,
      },
    });
    if (!matchCoach) return next(appError(400, NOT_FOUND_COACH_ERR));
    const data = {
      user: {
        name: matchCoach.user.name,
        role: matchCoach.user.role,
      },
      coach: {
        id: matchCoach.id,
        user_id: matchCoach.user_id,
        experience_years: matchCoach.experience_years,
        description: matchCoach.description,
        profile_image_url: matchCoach.profile_image_url,
        created_at: matchCoach.created_at,
        updated_at: matchCoach.updated_at,
        skills: matchCoach.coachSkills.map((s) => s.name),
      },
    };
    res.status(200).json({
      status: "success",
      data,
    });
  }, // 取得特定教練資料
  async getCoachsCourses(req, res, next) {
    const { coachId } = req.params;
    if (!isValidString(coachId) || !isValidUUID(coachId))
      return next(appError(400, INPUT_ERR));
    const coachRepo = dataSource.getRepository("Coach");
    const matchCoach = await coachRepo.findOneBy({ id: coachId });
    if (!matchCoach) return next(appError(400, NOT_FOUND_COACH_ERR));
    const now = new Date().toISOString();
    const courseRepo = dataSource.getRepository("Course");
    const courses = await courseRepo.find({
      where: {
        user_id: matchCoach.user_id,
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
  }, // 取得特定教練未結束的課表
};

module.exports = publicCoachController;
