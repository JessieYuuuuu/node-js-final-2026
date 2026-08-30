const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString, isValidUUID } = require("../utils/validUtils");

const INPUT_ERR = "欄位未填寫正確";
const NOT_FOUND_PACKAGE = "ID錯誤";
const CreditPackageController = {
  async getCreditPackage(req, res, next) {
    const CreditPackage = await dataSource.getRepository("CreditPackage").find({
      select: { id: true, name: true, credit_amount: true, price: true },
      order: { created_at: "ASC" },
    });
    res.json({ status: "success", data: CreditPackage });
    return;
  },

  async postCreditPackage(req, res, next) {
    const { name, credit_amount, price } = req.body;
    const errorMessages = [];
    if (!isValidString(name)) {
      errorMessages.push("名稱");
    } else if (!Number.isInteger(credit_amount) || credit_amount < 0) {
      errorMessages.push("點數數量");
    } else if (!Number.isInteger(price) || price < 0) {
      errorMessages.push("價格");
    }
    if (errorMessages.length > 0) {
      next(appError(400, `欄位未填寫正確: ${errorMessages.join(", ")}`));
      return;
    }
    const CreditPackageRepo = dataSource.getRepository("CreditPackage");
    const existing = await CreditPackageRepo.findOneBy({ name: name.trim() });
    if (existing) {
      next(appError(409, "資料重複"));
      return;
    }
    const CreditPackage = await CreditPackageRepo.save({
      name: name.trim(),
      credit_amount,
      price,
    });
    res.json({ status: "success", data: CreditPackage });
  },

  async deleteCreditPackage(req, res, next) {
    try {
      const { CreditPackageId } = req.params;
      const result = await dataSource
        .getRepository("CreditPackage")
        .delete(CreditPackageId);
      if (result.affected === 0) {
        next(appError(400, "ID錯誤"));
        return;
      }
      res.json({
        status: "success",
        data: {
          raw: [],
          affected: result.affected,
        },
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async buyCreditPackage(req, res, next) {
    const { creditPackageId } = req.params;
    if (!isValidString(creditPackageId) || !isValidUUID(creditPackageId))
      return next(appError(400, INPUT_ERR));
    const cPackageRepo = dataSource.getRepository("CreditPackage");
    const findPackage = await cPackageRepo.findOneBy({ id: creditPackageId });
    if (!findPackage) return next(appError(400, NOT_FOUND_PACKAGE));
    const cPurchaseRepo = dataSource.getRepository("CreditPurchase");
    await cPurchaseRepo.save({
      user_id: req.user.id,
      credit_package_id: findPackage.id,
      purchase_credit: findPackage.credit_amount,
      purchase_price: findPackage.price,
    });
    res.json({
      status: "success",
      data: null,
    });
  }, // 使用者購買方案
};
module.exports = CreditPackageController;
