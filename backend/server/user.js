const { dataSource } = require("../db/data-source");
const getUserCredit = async (uid) => {
  const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
  const userBuy = await creditPurchaseRepo.findBy({
    user_id: uid,
  });
  const userPoint = userBuy.reduce((acc, p) => (acc += p.purchase_credit), 0);
  return { ...userBuy, userPoint };
}; // 取得使用者購買方案的所有紀錄與堂數加總
const getUserBooking = async (uid, needDetal = false) => {
  const bookingRepo = dataSource.getRepository("CourseBooking");
  const options = {
    where: { user_id: uid },
  };
  if (needDetal)
    options.relations = {
      course: { user: true },
    };
  const userBooking = await bookingRepo.find(options);
  return userBooking;
}; // 取得使用者預約課程的所有紀錄
module.exports = { getUserCredit, getUserBooking };
