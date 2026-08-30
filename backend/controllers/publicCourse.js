const { MoreThan, LessThanOrEqual } = require("typeorm");
const { dataSource } = require("../db/data-source");

const publicCourseController = {
  async getCourses(req, res, next) {
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
  }, // 回傳進行中的課表
};
module.exports = publicCourseController;
