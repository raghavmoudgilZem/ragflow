export const DEFAULT_LOG_LEVEL = "debug";
export const DEFAULT_PORT = 5300;
export const DEFAULT_API_CALL_TIMEOUT_IN_MS = 5000;

//rate-limit related constants
export const RATE_LIMIT_PROPS = {
  STANDARD_HEADERS: "draft-7" as "draft-7",
  WINDOW_MS: 60 * 60 * 1000,
  WINDOW_MAX_LIMIT: 500,
  ERROR_MESSAGE_TXT: "Too many request. Try again later",
  LEGACY_HEADERS: false,
  STATUS_CODE: 429,
};

//headerKeys
export const HEADER_USER_ID_KEY = "x-user-id";

//document related constants
export const DOC_PARSE_TYPE_OPTIONS = [
  "book",
  "qa",
  "general",
  "resume",
  "manual",
  "table",
  "one",
  "tag",
  "paper",
  "laws",
  "presentation",
] as const;
export const DOC_SOURCE = ["manual_upload"] as const;
export const DOC_FILE_TYPES = ["pdf", "jpg", "jpeg", "png"] as const;

//error related constants
export const DEFAULT_NOTFOUND_ERROR_MESSAGE = "Not Found";
export const DEFAULT_BADREQUEST_ERROR_MESSAGE = "Bad Request";
export const DEFAULT_INTERNALSERVER_ERROR_MESSAGE = "Internal Server Error";
export const DEFAULT_CONFLICT_ERROR_MESSAGE = "Conflict Detected";
