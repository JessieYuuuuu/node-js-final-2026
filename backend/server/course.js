const { dataSource } = require("../db/data-source");
const getUserCredit = async (uid) => {
  const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
  const userBuy = await creditPurchaseRepo.findBy({
    user_id: uid,
  });
  const userPoint = userBuy.reduce((acc, p) => (acc += p.purchase_credit), 0);
  return { ...userBuy, userPoint };
}; // 取得使用者購買方案的所有紀錄與堂數加總
const getCourseBooking = async (cid) => {
  const bookingRepo = dataSource.getRepository("CourseBooking");
  const courseBooking = await bookingRepo.findBy({ course_id: cid });
  return courseBooking;
}; // 取得指定課程的所有預約紀錄
module.exports = { getUserCredit, getCourseBooking };
