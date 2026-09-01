const router = require("express").Router();
const creditPackageController = require("../controllers/creditPackage");
const isAuth = require("../middlewares/isAuth");
router.get("/", creditPackageController.getCreditPackage);
router.post("/", creditPackageController.postCreditPackage);
router.delete("/:creditPackageId", creditPackageController.deleteCreditPackage);

// M5 購買堂數(需登入)
router.post(
  "/:creditPackageId",
  isAuth,
  creditPackageController.buyCreditPackage,
);

module.exports = router;
