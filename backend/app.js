const config = require("./config/index");
const express = require("express");
const cors = require("cors");
const { dataSource } = require("./db/data-source");
const appError = require("./utils/appError");
const app = express();
app.use(cors());
app.use(express.json());

// M0 healthcheck（下一步實作）
app.get("/healthcheck", async (req, res) => {
  try {
    await dataSource.query("SELECT 1"); // 確認資料庫活著
    res.status(200).send("OK");
  } catch (error) {
    res.status(503).send("Service Unavailable");
  }
});

// 路由掛載（後續步驟逐一加入）
app.use("/api/coaches/skill", require("./routes/skill"));
app.use("/api/users", require("./routes/users"));
app.use("/api/credit-package", require("./routes/creditPackage"));

// 404 錯誤
app.use((req, res, next) => {
  next(appError(404, "Not Found!!"));
  return;
});

// 攔截全域錯誤
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "failed",
    message: err.message || "伺服器錯誤",
  });
  return;
});

// 啟動資料庫連線與伺服器
dataSource
  .initialize()
  .then(() => {
    console.log("資料庫連線成功", config.get("web.port"));
    app.listen(config.get("web.port"), () => {
      console.log(`資料庫啟動中，連線在: ${config.get("web.port")}`);
    });
  })
  .catch((err) => {
    console.log("資料庫連線失敗", config.get("web.port"));
    console.error("資料庫連不到!!!", err);
    process.exit(1);
  });
