// entities/Skill.js
const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Skill",
  tableName: "skills",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 50, nullable: false, unique: true },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    coachSkills: {
      type: "one-to-many",
      target: "CoachSkills", // ← 對應 Entity 的 name，不是 tableName
      inverseSide: "skill", // ← 對應 CoachSkills Entity 的 relations 屬性名
    },
  },
});
