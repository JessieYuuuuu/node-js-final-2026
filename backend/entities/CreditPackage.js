const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CreditPackage",
  tableName: "credit_package",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    name: { type: "varchar", length: 50, nullable: false },
    credit_amount: { type: "integer", nullable: false, default: 0 },
    price: { type: "integer", nullable: false, default: 0 },
    created_at: { type: "timestamp", createDate: true },
  },
});
