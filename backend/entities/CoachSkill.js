// 教練技能關係表
const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CoachSkill",
  tableName: "coach_skill",
  columns: {
    coach_id: { type: "uuid", primary: true },
    skill_id: { type: "uuid", primary: true },
  },
  relations: {
    coach: {
      type: "many-to-one",
      target: "Coach",
      joinColumn: { name: "coach_id" },
    },
    skill: {
      type: "many-to-one",
      target: "Skill",
      joinColumn: { name: "skill_id" },
    },
  },
});
