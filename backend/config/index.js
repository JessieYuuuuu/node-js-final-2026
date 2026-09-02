require("dotenv").config();
const db = require("./db");
const web = require("./web");
const secret = require("./secret");
const r2 = require("./r2");

const config = { db, web, secret, r2 };
// config.get("db.host") => config.db.host
const get = (path) => {
  const keys = path.split("."); //根據.分割path
  let result = config;
  for (const key of keys) {
    result = result[key];
    // 找不到的話要丟錯誤
    if (result === undefined) throw new Error(`Config path not found: ${path}`);
  }
  // 找到就回傳
  return result;
};

module.exports = { get };
