import i18next from "i18next";
import { formatName } from "./formatName";

export const validator = {
  checkNotEmpty: (object: unknown): boolean => {
    if (typeof object === "undefined" || object === null) return false;
    if (typeof object === "string") return !!object && object.trim().length > 0;
    if (Array.isArray(object)) return object.length > 0;
    if (!isNaN(object as number)) return true;
    return true;
  },

  checkEmail: (email: string): boolean => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email);
  },

  checkSignupVerificationCode: (code: string): boolean => code?.length >= 6,
  checkLoginVerificationCode: (code: string): boolean => code?.length >= 6,
  checkResetPasswordVerificationCode: (code: string): boolean => code?.length >= 6,

  checkPasswordRequirement: (password: string) => [
    { name: i18next.t("common:text.password.requirement.minChars"), result: password.length >= 8 },
  ],

  checkClientProfileComplete: (client: Record<string, unknown> | null): boolean => {
    if (!client) return false;
    const { firstName, lastName, nric, dateOfBirth, countryOfBirth, nationality, mobile } = client;
    const name = formatName(firstName as string, lastName as string);
    return [name, nric, dateOfBirth, countryOfBirth, nationality, mobile].every(validator.checkNotEmpty);
  },
};

export default validator;
