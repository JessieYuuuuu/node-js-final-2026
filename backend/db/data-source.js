const { DataSource } = require("typeorm");
const config = require("../config");
const dataSource = new DataSource({
  type: "postgres",
  host: config.get("db.host"),
  port: config.get("db.port"),
  username: config.get("db.username"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  synchronize: config.get("db.synchronize"),
  ssl: config.get("db.ssl"),
  entities: [
    // TODO: 資料表未建立完整，共8張
    require("../entities/User"), // 使用者
    require("../entities/Skill"), // 技能
    require("../entities/CreditPackage"), // 方案
    require("../entities/Coach"), // 教練
  ],
});
module.exports = { dataSource };
