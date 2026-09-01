// 共用驗證工具
const isValidString = (value) =>
  typeof value === "string" && value.trim() !== "";
const isValidStringArr = (arr) => arr.every((value) => isValidString(value));
const isValidUUID = (value) =>
  isValidString(value) &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
const isInteger = (value) =>
  typeof value === "number" && Number.isInteger(value);
const isValidPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/.test(value);
const isValidUrl = (url) => url.startsWith("https://");
const isValidCoach = (role) => role === "COACH";

module.exports = {
  isValidString,
  isValidStringArr,
  isInteger,
  isValidPassword,
  isValidUUID,
  isValidUrl,
  isValidCoach,
};
