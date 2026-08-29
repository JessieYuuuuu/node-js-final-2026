const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Coach",
  tableName: "coach",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid", nullable: false, unique: true },
    experience_years: { type: "integer", nullable: false, default: 0 },
    description: { type: "text", nullable: false },
    profile_image_url: { type: "varchar", length: 2048, nullable: false },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    coachSkills: {
      type: "one-to-many", // 一個教練有多個技能
      target: "CoachSkill",
      inverseSide: "coach",
    },
  },
});
