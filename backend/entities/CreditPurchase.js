const { EntitySchema } = require("typeorm");
module.exports = new EntitySchema({
  name: "CreditPurchase",
  tableName: "credit_purchase",
  columns: {
    id: { type: "uuid", primary: true, generated: "uuid" },
    user_id: { type: "uuid", nullable: false },
    credit_package_id: { type: "uuid", nullable: false },
    purchase_credit: { type: "integer", nullable: false, default: 0 },
    purchase_price: { type: "integer", nullable: false, default: 0 },
    purchase_at: { type: "timestamp", createDate: true },
    created_at: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
    },
    creditPackage: {
      type: "many-to-one",
      target: "CreditPackage",
      joinColumn: { name: "credit_package_id", referencedColumnName: "id" },
    },
  },
});
