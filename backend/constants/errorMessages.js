const INPUT_ERR = "欄位未填寫正確";
const ID_ERR = "ID錯誤";
const PW_ERR =
  "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字";
const EMAIL_ERR = "Email 已被使用";
const LOGIN_USER_NOT_FOUND_ERR = "使用者不存在或密碼輸入錯誤";
const USER_NOT_FOUND_ERR = "使用者不存在";
const NEW_PASSWORD_SAME_AS_OLD = "新密碼不能與舊密碼相同";
const PASSWORD_CONFIRMATION_MISMATCH = "兩次輸入的新密碼不一致";
const COACH_NOT_FOUND_ERR = "找不到該教練";
const USER_IS_COACH_ERR = "使用者已經是教練";
const COURSE_NOT_FOUND_ERR = "課程不存在";
const MAX_PARTICIPANTS_ERR = "已達最大參加人數，無法參加";
const NOT_POINT_ERR = "已無可使用堂數";
const HAS_BOOKING_ERR = "已經報名過此課程";
const DATA_DUPLICATE_ERR = "資料重複";
const USER_NAME_UNCHANGED_ERR = "使用者名稱未變更";
const UPDATE_USER_FAILED_ERR = "更新使用者資料失敗";
const PASSWORD_INCORRECT_ERR = "密碼輸入錯誤";
const UPLOAD_FILE_REQUIRED_ERR = "請上傳圖片";
const UPLOAD_FILE_TYPE_ERR = "只允許上傳 jpg 或 png 圖片";
const UPLOAD_ERR = "上傳檔案格式錯誤";
const UPLOAD_ERROR_MESSAGES = Object.freeze({
  LIMIT_FILE_SIZE: "圖片大小不能超過 2MB",
  LIMIT_FILE_COUNT: "一次只能上傳一張圖片",
  LIMIT_UNEXPECTED_FILE: "上傳欄位名稱必須是 file",
});
const CREDIT_PACKAGE_FIELD_LABELS = Object.freeze({
  NAME: "名稱",
  CREDIT_AMOUNT: "點數數量",
  PRICE: "價格",
});

const getInputFieldsErr = (fields) => `${INPUT_ERR}: ${fields.join(", ")}`;

module.exports = {
  INPUT_ERR,
  ID_ERR,
  PW_ERR,
  EMAIL_ERR,
  LOGIN_USER_NOT_FOUND_ERR,
  USER_NOT_FOUND_ERR,
  NEW_PASSWORD_SAME_AS_OLD,
  PASSWORD_CONFIRMATION_MISMATCH,
  COACH_NOT_FOUND_ERR,
  USER_IS_COACH_ERR,
  COURSE_NOT_FOUND_ERR,
  MAX_PARTICIPANTS_ERR,
  NOT_POINT_ERR,
  HAS_BOOKING_ERR,
  DATA_DUPLICATE_ERR,
  USER_NAME_UNCHANGED_ERR,
  UPDATE_USER_FAILED_ERR,
  PASSWORD_INCORRECT_ERR,
  UPLOAD_FILE_REQUIRED_ERR,
  UPLOAD_FILE_TYPE_ERR,
  UPLOAD_ERR,
  UPLOAD_ERROR_MESSAGES,
  CREDIT_PACKAGE_FIELD_LABELS,
  getInputFieldsErr,
};
