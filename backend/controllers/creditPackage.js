const { appError, appSuccess } = require("../utils/responseUtils");
const { isValidString, isValidUUID } = require("../utils/validUtils");
const { creditPackageRepo, creditPurchaseRepo } = require("../db/repositories");
const {
  INPUT_ERR,
  ID_ERR,
  DATA_DUPLICATE_ERR,
  CREDIT_PACKAGE_FIELD_LABELS,
  getInputFieldsErr,
} = require("../constants/errorMessages");

const CreditPackageController = {
  async getCreditPackage(req, res, next) {
    const CreditPackage = await creditPackageRepo.find({
      select: { id: true, name: true, credit_amount: true, price: true },
      order: { created_at: "ASC" },
    });
    res.json(appSuccess(CreditPackage));
    return;
  },

  async postCreditPackage(req, res, next) {
    const { name, credit_amount, price } = req.body;
    const errorMessages = [];
    if (!isValidString(name))
      errorMessages.push(CREDIT_PACKAGE_FIELD_LABELS.NAME);
    else if (!Number.isInteger(credit_amount) || credit_amount < 0)
      errorMessages.push(CREDIT_PACKAGE_FIELD_LABELS.CREDIT_AMOUNT);
    else if (!Number.isInteger(price) || price < 0)
      errorMessages.push(CREDIT_PACKAGE_FIELD_LABELS.PRICE);
    if (errorMessages.length > 0)
      return next(appError(400, getInputFieldsErr(errorMessages)));
    const existing = await creditPackageRepo.findOneBy({ name: name.trim() });
    if (existing) return next(appError(409, DATA_DUPLICATE_ERR));
    const CreditPackage = await creditPackageRepo.save({
      name: name.trim(),
      credit_amount,
      price,
    });
    const { created_at, ...creditPackageData } = CreditPackage;
    res.json(
      appSuccess({
        ...creditPackageData,
        createdAt: created_at,
      }),
    );
  },

  async deleteCreditPackage(req, res, next) {
    try {
      const { creditPackageId } = req.params;
      if (!isValidUUID(creditPackageId)) return next(appError(400, ID_ERR));
      const result = await creditPackageRepo.delete(creditPackageId);
      if (result.affected === 0) return next(appError(400, ID_ERR));
      res.json(
        appSuccess({
          raw: [],
          affected: result.affected,
        }),
      );
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async buyCreditPackage(req, res, next) {
    const { creditPackageId } = req.params;
    if (!isValidUUID(creditPackageId)) return next(appError(400, INPUT_ERR));
    const findPackage = await creditPackageRepo.findOneBy({
      id: creditPackageId,
    });
    if (!findPackage) return next(appError(400, ID_ERR));
    await creditPurchaseRepo.save({
      user_id: req.user.id,
      credit_package_id: findPackage.id,
      purchase_credit: findPackage.credit_amount,
      purchase_price: findPackage.price,
    });
    res.json(appSuccess(null));
  }, // 使用者購買方案
};
module.exports = CreditPackageController;
