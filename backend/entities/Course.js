const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "Course",
  tableName: "course",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 50, nullable: false },
    description: { type: "varchar", length: 255, nullable: false },
    max_participants: { type: "integer", nullable: false, default: 0 },
    start_at: { type: "text", nullable: false },
    end_at: { type: "text", nullable: false },
    meeting_url: { type: "varchar", length: 2048, nullable: false },
    created_at: { type: "timestamp", createDate: true },
    updated_at: { type: "timestamp", updateDate: true },
    user_id: { type: "uuid", nullable: false },
    skill_id: { type: "uuid", nullable: false },
  },
  relations: {
    user: {
      type: "many-to-one", // 多堂課可以被同一個使用者建立
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
    },
    skill: {
      type: "many-to-one", // 多堂課可以屬於同一個技能
      target: "Skill",
      joinColumn: {
        name: "skill_id",
        referencedColumnName: "id",
      },
    },
  },
});
