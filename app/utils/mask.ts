export const mask = {
  maskEmail: (email: string): string => {
    if (!email) {
      return "";
    }
    const parts = email.split("@");
    if (parts.length < 2) {
      return "";
    }

    const username = parts[0];
    const domain = parts[1];
    const maxShownChars = username.length > 5 ? 3 : 1;
    const maskedUsername = username.substring(0, maxShownChars) + "****";
    return `${maskedUsername}@${domain}`;
  },
};

export default mask;
