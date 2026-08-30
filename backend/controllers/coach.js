const { dataSource } = require("../db/data-source");
const { MoreThan, Between, IsNull } = require("typeorm");
const appError = require("../utils/appError");
const {
  isInteger,
  isValidString,
  isValidUUID,
} = require("../utils/validUtils");
// 規定提示文字
const INPUT_ERR = "欄位未填寫正確";

const coachController = {
  async upgradeToCoach(req, res, next) {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;
    if (
      !isValidString(description) ||
      !Number.isInteger(experience_years) ||
      experience_years < 0 ||
      (profile_image_url && !profile_image_url.startsWith("https://"))
    )
      return next(appError(400, INPUT_ERR));
    const userRepo = dataSource.getRepository("User");
    const coachRepo = dataSource.getRepository("Coach");
    const matchUser = await userRepo.findOneBy({ id: userId });
    if (!matchUser) return next(appError(404, "使用者不存在"));
    if (matchUser.role === "COACH")
      return next(appError(409, "使用者已經是教練"));
    const updatedUser = await userRepo.save({
      ...matchUser,
      role: "COACH",
    });
    const coach = await coachRepo.save({
      user_id: updatedUser.id,
      experience_years,
      description: description.trim(),
      profile_image_url: profile_image_url ? profile_image_url.trim() : null,
    });
    // 成功回201，資料只回 user 的 id（uuid 字串）與 name
    res.status(201).json({
      status: "success",
      data: {
        user: { name: updatedUser.name, role: "COACH" },
        coach: {
          coach_id: coach.id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
        },
      },
    });
  }, // 升級成教練
  async getCoachInfo(req, res, next) {
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOne({
      where: { user_id: req.user.id },
      relations: {
        coachSkills: true,
      },
    });
    // 登入成功要201，並回token
    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years: coach.experience_years,
        description: coach.description,
        profile_image_url: coach.profile_image_url,
        skill_ids: coach.coachSkills.map((skill) => skill.id),
      },
    });
  }, // 取得教練資訊
  async putCoachInfo(req, res, next) {
    const { experience_years, description, profile_image_url, skill_ids } =
      req.body;
    if (
      !Number.isInteger(experience_years) ||
      experience_years < 0 ||
      !isValidString(description) ||
      !isValidString(profile_image_url) ||
      (profile_image_url && !profile_image_url.startsWith("https://"))
    )
      return next(appError(400, INPUT_ERR));
    const coachRepo = dataSource.getRepository("Coach");
    const coach = await coachRepo.findOneBy({
      user_id: req.user.id,
    });
    const coachSkillsRepo = dataSource.getRepository("CoachSkill");
    await coachRepo.update(
      { user_id: req.user.id },
      {
        experience_years,
        description: description.trim(),
        profile_image_url: profile_image_url.trim(),
      },
    );
    // 更新技能關聯
    if (skill_ids) {
      // 先刪除現有關聯
      await coachSkillsRepo.delete({ coach_id: coach.id });
      // 新增新的關聯
      const newCoachSkills = skill_ids.map((skill_id) => ({
        coach_id: coach.id,
        skill_id,
      }));
      await coachSkillsRepo.save(newCoachSkills);
    }

    res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years,
        description: description.trim(),
        profile_image_url,
        skill_ids: skill_ids || [],
      },
    });
  }, // 更新教練資料(含整批更換技能)
  async getCoachs(req, res, next) {
    const { per, page } = req.query;
    const perNumber = Number(per);
    const pageNumber = Number(page);

    if (
      !isInteger(perNumber) ||
      !isInteger(pageNumber) ||
      perNumber <= 0 ||
      pageNumber <= 0
    ) {
      return next(appError(400, INPUT_ERR));
    }
    const coachRepo = dataSource.getRepository("Coach");
    const coachs = await coachRepo.find({
      take: perNumber,
      skip: (pageNumber - 1) * perNumber,
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
  },
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
    if (!matchCoach) return next(appError(400, "找不到該教練"));
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
  },
  async getCoachsCourses(req, res, next) {
    const { coachId } = req.params;
    if (!isValidString(coachId) || !isValidUUID(coachId))
      return next(appError(400, INPUT_ERR));
    const coachRepo = dataSource.getRepository("Coach");
    const matchCoach = await coachRepo.findOneBy({ id: coachId });
    if (!matchCoach) return next(appError(400, "找不到該教練"));
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
  },
  async getRevenue(req, res, next) {
    // Available values : january, february, march, april, may, june, july, august, september, october, november, december
    const { month } = req.query;
    const MONTH_NAMES = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    const monthIndex = MONTH_NAMES.indexOf(month);
    if (monthIndex === -1) return next(appError(400, INPUT_ERR));
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, monthIndex, 1);
    const startOfNextMonth = new Date(currentYear, monthIndex + 1, 1);
    const endOfMonth = new Date(startOfNextMonth.getTime() - 1);
    const bookingRepo = dataSource.getRepository("CourseBooking");
    const courseBookings = await bookingRepo.find({
      where: {
        cancelled_at: IsNull(),
        created_at: Between(startOfMonth, endOfMonth),
        course: {
          user_id: req.user.id,
        },
      },
      relations: {
        course: {
          user: true,
        },
      },
    }); // 找到預約紀錄中是該教練，且未被取消的數量

    // 無重複的報名者
    const notReUser = new Set(courseBookings.map((b) => b.user_id));

    // 計算一堂課的單價:方案售價總和/方案堂數總和
    const cPackageRepo = dataSource.getRepository("CreditPackage");
    const findPackage = await cPackageRepo.find();
    const allCredit = findPackage.reduce(
      (acc, p) => (acc += p.credit_amount),
      0,
    );
    const allPrice = findPackage.reduce((acc, p) => (acc += p.price), 0);
    const averagePrice = allCredit > 0 ? allPrice / allCredit : 0;
    const revenue = Math.floor(courseBookings.length * averagePrice);
    res.status(200).json({
      status: "success",
      data: {
        total: {
          revenue, // 營收
          participants: notReUser.size, // 該月不重複報名的學員
          course_count: courseBookings.length, // 該月未取消的報名數
        },
      },
    });
  }, // 教練報表
};

module.exports = coachController;
