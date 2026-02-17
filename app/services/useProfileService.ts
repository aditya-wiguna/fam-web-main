import { useState, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { api } from "./api";
import { AuthContext } from "../contexts";
import type { Profile } from "../contexts";
import { ProfileDataField, ALL_FIELDS_NAMES } from "../utils/ProfileDataField";

dayjs.extend(utc);

export function useProfileService() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processProfile = (profile: Record<string, unknown>) => {
    const processedProfile = { ...profile };
    if (processedProfile[ProfileDataField.DATE_OF_BIRTH]) {
      const dateOfBirthValue = processedProfile[ProfileDataField.DATE_OF_BIRTH];
      processedProfile[ProfileDataField.DATE_OF_BIRTH] = dayjs(dateOfBirthValue as string).format("YYYY-MM-DD");
    }
    return processedProfile;
  };

  const save = useCallback(async (idOrProfile: string | Profile, profileData?: Record<string, unknown>) => {
    try {
      setError("");
      setLoading(true);
      
      let id: string;
      let body: Record<string, unknown>;
      
      if (typeof idOrProfile === "string") {
        // Called as save(id, data)
        id = idOrProfile;
        body = processProfile(profileData || {});
      } else {
        // Called as save(profile)
        id = idOrProfile.id;
        body = processProfile(idOrProfile);
      }
      
      // If id is still missing, try to get it from the body or fetch fresh
      if (!id || id === "undefined" || id === "null") {
        if (body.id && body.id !== "undefined" && body.id !== "null") {
          id = body.id as string;
        }
      }
      if (!id || id === "undefined" || id === "null") {
        if (user?.userId) {
          // Fetch profile to get the customer ID
          const result = await api.get<Profile[]>(`/customer/v1/customers?query=userId==${user.userId}`);
          if (result && result.length > 0 && result[0].id) {
            id = result[0].id;
          }
        }
      }
      
      if (!id || id === "undefined" || id === "null") {
        throw new Error("Customer ID is required to save profile");
      }
      
      const data = await api.put<Profile>(`/customer/v1/customers/${id}`, body);
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error saving profile", e);
      setError(t("common:error.profile.save"));
      setLoading(false);
      throw e;
    }
  }, [t, user]);

  const saveDeclarationInfo = useCallback(async (id: string, additionalInfo: Record<string, unknown>) => {
    try {
      setError("");
      setLoading(true);
      
      let customerId = id;
      // Fallback: fetch customer ID if missing
      if ((!customerId || customerId === "undefined" || customerId === "null") && user?.userId) {
        const result = await api.get<Profile[]>(`/customer/v1/customers?query=userId==${user.userId}`);
        if (result && result.length > 0 && result[0].id) {
          customerId = result[0].id;
        }
      }
      if (!customerId || customerId === "undefined" || customerId === "null") {
        throw new Error("Customer ID is required to save declaration");
      }
      
      const data = await api.put(`/customer/v1/customers/${customerId}/additional/declaration`, additionalInfo);
      setLoading(false);
      return data;
    } catch (e) {
      console.error("Error saving declaration", e);
      setError(t("common:error.profile.save"));
      setLoading(false);
      throw e;
    }
  }, [t, user]);

  const get = useCallback(async (id?: string): Promise<Profile> => {
    const userId = id || user?.userId;
    if (!userId) throw new Error("No user ID");
    
    try {
      setError("");
      setLoading(true);
      const result = await api.get<Profile[]>(`/customer/v1/customers?query=userId==${userId}`);
      const data: Record<string, unknown> = {};
      
      if (result.length > 0) {
        // Copy id and userId first
        data.id = result[0].id;
        data.userId = result[0].userId;
        
        ALL_FIELDS_NAMES.forEach((fieldName) => {
          let value = result[0][fieldName];
          if (typeof value === "undefined" || value === null) {
            if (fieldName === ProfileDataField.MAILING_USE_RESIDENCE) {
              value = true;
            } else if (fieldName === ProfileDataField.US_PERSON) {
              value = false;
            } else {
              value = "";
            }
          } else if (fieldName === ProfileDataField.DATE_OF_BIRTH) {
            value = dayjs.utc(value as string).toDate();
          }
          data[fieldName] = value;
        });
      } else {
        setError(t("common:error.profile.load"));
      }
      setLoading(false);
      return data as Profile;
    } catch (e) {
      console.error("Error loading profile", e);
      setError(t("common:error.profile.load"));
      setLoading(false);
      throw e;
    }
  }, [t, user]);

  const getUnregistered = useCallback(async (email: string, code: string): Promise<{ registered?: boolean; data?: { firstName?: string } }> => {
    try {
      setLoading(true);
      const data = await api.get<{ firstName?: string }>(`/customer/v1/customers/unregistered-investors?email=${email}&code=${code}`);
      setLoading(false);
      return { registered: false, data };
    } catch (e: unknown) {
      setLoading(false);
      const error = e as { response?: { status?: number } };
      if (error.response?.status === 409) {
        return { registered: true, data: {} };
      }
      return {};
    }
  }, []);

  return { save, saveDeclarationInfo, get, getUnregistered, loading, error };
}

export default useProfileService;
