const router = require("express").Router();
const isAuth = require("../middlewares/isAuth");
const uploadController = require("../controllers/upload");
const single = require("../middlewares/uploadImage");

router.post("/", isAuth, single("file"), uploadController.uploadImage);
module.exports = router;
