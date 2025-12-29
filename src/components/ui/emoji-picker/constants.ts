export const enum EmojiCategory {
  FREQUENT = "frequent",
  PEOPLE = "people",
  NATURE = "nature",
  FOODS = "foods",
  ACTIVITY = "activity",
  PLACES = "places",
  OBJECTS = "objects",
  SYMBOLS = "symbols",
  FLAGS = "flags",
}

export const enum SkinTone {
  DEFAULT = 1,
  LIGHT = 2,
  MEDIUM_LIGHT = 3,
  MEDIUM = 4,
  MEDIUM_DARK = 5,
  DARK = 6,
}

export const enum StorageKey {
  FREQUENT_EMOJIS = "emoji-picker.frequent",
  LAST_EMOJI = "emoji-picker.last",
  SKIN_TONE = "emoji-picker.skin-tone",
}

export const enum EmojiSet {
  NATIVE = "native",
  APPLE = "apple",
  FACEBOOK = "facebook",
  GOOGLE = "google",
  TWITTER = "twitter",
}

export const enum Locale {
  EN = "en",
  AR = "ar",
  BE = "be",
  CS = "cs",
  DE = "de",
  ES = "es",
  FA = "fa",
  FI = "fi",
  FR = "fr",
  HI = "hi",
  IT = "it",
  JA = "ja",
  KO = "ko",
  NL = "nl",
  PL = "pl",
  PT = "pt",
  RU = "ru",
  SA = "sa",
  TR = "tr",
  UK = "uk",
  VI = "vi",
  ZH = "zh",
}

export const DEFAULT_EMOJI_VERSION = 15;
export const DEFAULT_PER_LINE = 9;
export const DEFAULT_MAX_FREQUENT_ROWS = 4;
