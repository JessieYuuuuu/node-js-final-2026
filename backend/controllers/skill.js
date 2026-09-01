const { appError, appSuccess } = require("../utils/responseUtils");
const { isValidString, isValidUUID } = require("../utils/validUtils");
const { skillRepo } = require("../db/repositories");
const {
  INPUT_ERR,
  ID_ERR,
  DATA_DUPLICATE_ERR,
} = require("../constants/errorMessages");
const skillController = {
  async getSkills(req, res, next) {
    const skills = await skillRepo.find({
      select: { id: true, name: true },
      order: { created_at: "ASC" },
    });
    return res.json(appSuccess(skills));
  },

  async postSkill(req, res, next) {
    const { name } = req.body;
    if (!isValidString(name)) return next(appError(400, INPUT_ERR));
    const existing = await skillRepo.findOneBy({ name: name.trim() });
    if (existing) return next(appError(409, DATA_DUPLICATE_ERR));
    const skill = await skillRepo.save({ name: name.trim() });
    res.json(appSuccess({ ...skill, createdAt: skill.created_at }));
  },

  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      if (!isValidUUID(skillId)) return next(appError(400, ID_ERR));
      const result = await skillRepo.delete(skillId);
      if (result.affected === 0) return next(appError(400, ID_ERR));
      res.json(appSuccess(null));
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};
module.exports = skillController;
