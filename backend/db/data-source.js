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
    require("../entities/User"),
    require("../entities/Skill"),
    require("../entities/Coach"),
  ],
});
module.exports = { dataSource };
