const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");
// 規定提示文字
const INPUT_ERR = "欄位未填寫正確";

const usersController = {
  async upgradeToCoach(req, res, next) {
    /* 
  欄位缺漏或格式不對（experience_years 不是 0 以上的整數、description 是空字串、profile_image_url 有值但不是 https 開頭）→「欄位未填寫正確」
userId 查不到對應的使用者 →「使用者不存在」
使用者已經是教練
    */
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
      return next(appError(400, "使用者已經是教練"));
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
    const coachSkillsRepo = dataSource.getRepository("CoachSkills");
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
};

module.exports = usersController;
