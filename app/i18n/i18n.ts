import "dayjs/locale/en";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import i18next from "i18next";
import numeral from "numeral";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import zh from "./translations/zh.json";

dayjs.extend(utc);

if (i18next && !i18next.isInitialized && initReactI18next) {
  i18next.use(initReactI18next).init({
    resources: { en, zh },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
      format: (value, format) => {
        if (value instanceof Date) return dayjs(value).format(format);
        if (typeof value === "number") return numeral(value).format(format);
        return value;
      },
    },
  });
  dayjs.extend(localizedFormat);
}

export default i18next;
