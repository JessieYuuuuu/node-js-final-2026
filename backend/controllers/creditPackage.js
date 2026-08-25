const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { isValidString } = require("../utils/validUtils");

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
    } else if (typeof credit_amount !== "number" || credit_amount <= 0) {
      errorMessages.push("點數數量");
    } else if (typeof price !== "number" || price <= 0) {
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
};
module.exports = CreditPackageController;
