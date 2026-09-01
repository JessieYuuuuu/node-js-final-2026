const { dataSource } = require("./data-source");

const userRepo = dataSource.getRepository("User");
const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
const courseBookingRepo = dataSource.getRepository("CourseBooking");
const courseRepo = dataSource.getRepository("Course");
const coachRepo = dataSource.getRepository("Coach");
const coachSkillRepo = dataSource.getRepository("CoachSkill");
const creditPackageRepo = dataSource.getRepository("CreditPackage");
const skillRepo = dataSource.getRepository("Skill");

module.exports = {
  userRepo,
  creditPurchaseRepo,
  courseBookingRepo,
  courseRepo,
  coachRepo,
  coachSkillRepo,
  creditPackageRepo,
  skillRepo,
};
