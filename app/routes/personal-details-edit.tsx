import { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { H1, P, Button, Input, TopNav, Alert, Link, Skeleton } from "../components";
import { ProfileContext, AuthContext } from "../contexts";
import { ProfileDataField } from "../utils/ProfileDataField";
import { useProfileService } from "../services/useProfileService";

const countryList = [
  { countryCode: "SGP", countryName: "Singapore" },
  { countryCode: "MYS", countryName: "Malaysia" },
  { countryCode: "IDN", countryName: "Indonesia" },
  { countryCode: "USA", countryName: "United States" },
  { countryCode: "GBR", countryName: "United Kingdom" },
  { countryCode: "AUS", countryName: "Australia" },
  { countryCode: "CHN", countryName: "China" },
  { countryCode: "IND", countryName: "India" },
  { countryCode: "JPN", countryName: "Japan" },
  { countryCode: "KOR", countryName: "South Korea" },
  { countryCode: "THA", countryName: "Thailand" },
  { countryCode: "VNM", countryName: "Vietnam" },
  { countryCode: "PHL", countryName: "Philippines" },
];

export default function PersonalDetailsEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { profile, riskProfile, updateProfileData } = useContext(ProfileContext);
  const { save, get, loading, error } = useProfileService();
  
  const [data, setData] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(0); // 0 = basic info, 1 = address
  const [submitError, setSubmitError] = useState("");

  const mode = searchParams.get("mode") || "update";
  const productId = searchParams.get("productId");

  useEffect(() => {
    if (profile) {
      const initialData = { ...profile };
      // Set default country values
      const countriesFields = [
        ProfileDataField.IDENTITY_DOC_COUNTRY,
        ProfileDataField.NATIONALITY,
        ProfileDataField.BIRTH_COUNTRY,
        ProfileDataField.RESIDENCE_COUNTRY,
        ProfileDataField.MAILING_COUNTRY,
      ];
      countriesFields.forEach((field) => {
        if (!initialData[field]) {
          initialData[field] = "SGP";
        }
      });
      setData(initialData);
    }
  }, [profile]);

  const updateField = (fieldName: string) => (value: string) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleNext = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/personal-details");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError("");
      
      // Build the profile data to save from current form data
      const profileToSave = { ...data };
      Object.keys(profileToSave).forEach((key) => {
        const value = profileToSave[key];
        if (typeof value === "string") {
          profileToSave[key] = value.trim();
        }
      });
      if (!profileToSave.profileType) {
        profileToSave.profileType = "MANUAL";
      }
      
      // Ensure the profile data includes the id from context
      if (profile?.id) {
        profileToSave.id = profile.id;
      }
      if (profile?.userId) {
        profileToSave.userId = profile.userId;
      }
      
      // Use save(profile) overload - pass the whole object so save() can extract id itself
      await save(profileToSave as unknown as import("../contexts").Profile);
      
      // Refresh profile after save
      const userId = profile?.userId || data.userId || user?.userId;
      if (userId) {
        const updatedProfile = await get(userId as string);
        updateProfileData(updatedProfile);
      }
      
      if (mode === "subscribe" && productId) {
        if (riskProfile) {
          navigate(`/subscribe?productId=${productId}`);
        } else {
          navigate(`/risk-assessment?mode=subscribe&productId=${productId}`);
        }
      } else if (mode === "signup") {
        navigate("/");
      } else {
        navigate("/personal-details");
      }
    } catch (e) {
      console.error("Error saving profile", e);
      setSubmitError(t("common:error.profile.save"));
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => navigate("/profile")} />
          <div className="text-center py-12">
            <P>{t("common:text.pleaseLogin")}</P>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched
  if (!profile) {
    return (
      <div className="min-h-screen bg-white pb-8">
        <div className="px-5">
          <TopNav allowBack onBack={() => navigate("/personal-details")} />
          <div className="pb-4">
            <H1>{t("personalDetails:heading.title")}</H1>
          </div>
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        </div>
      </div>
    );
  }

  // Step 1: Basic Info
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white pb-8">
        <div className="px-5">
          <TopNav 
            allowBack 
            onBack={handleBack}
            rightContent={
              mode === "signup" && (
                <Link onClick={handleSkip}>{t("common:link.skip")}</Link>
              )
            }
          />
          
          <div className="pb-4">
            <H1>{t("personalDetails:heading.title")}</H1>
          </div>

          <div className="mb-6">
            <P color="grey700">{t("personalDetails:text.instruction")}</P>
          </div>

          {(error || submitError) && <Alert className="mb-4">{error || submitError}</Alert>}

          <div className="space-y-1">
            <Input
              label={t("personalDetails:form.nameFirst.label")}
              placeholder={t("personalDetails:form.nameFirst.placeholder")}
              value={data[ProfileDataField.NAME_FIRST] as string || ""}
              onValueChange={updateField(ProfileDataField.NAME_FIRST)}
            />
            <Input
              label={t("personalDetails:form.nameLast.label")}
              placeholder={t("personalDetails:form.nameLast.placeholder")}
              value={data[ProfileDataField.NAME_LAST] as string || ""}
              onValueChange={updateField(ProfileDataField.NAME_LAST)}
            />
            <Input
              label={t("personalDetails:form.contactMobile.label")}
              placeholder={t("personalDetails:form.contactMobile.placeholder")}
              value={data[ProfileDataField.CONTACT_MOBILE] as string || ""}
              onValueChange={updateField(ProfileDataField.CONTACT_MOBILE)}
              type="tel"
            />
            <Input
              label={t("personalDetails:form.dateOfBirth.label")}
              placeholder={t("personalDetails:form.dateOfBirth.placeholder")}
              value={data[ProfileDataField.DATE_OF_BIRTH] ? dayjs(data[ProfileDataField.DATE_OF_BIRTH] as string).format("YYYY-MM-DD") : ""}
              onValueChange={(val) => setData(prev => ({ ...prev, [ProfileDataField.DATE_OF_BIRTH]: val }))}
              type="date"
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("personalDetails:form.birthCountry.label")}
              </label>
              <select
                value={data[ProfileDataField.BIRTH_COUNTRY] as string || "SGP"}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.BIRTH_COUNTRY]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {countryList.map(({ countryCode, countryName }) => (
                  <option key={countryCode} value={countryCode}>{countryName}</option>
                ))}
              </select>
            </div>

            <Input
              label={t("personalDetails:form.identityDocID.label")}
              placeholder={t("personalDetails:form.identityDocID.placeholder")}
              value={data[ProfileDataField.IDENTITY_DOC_ID] as string || ""}
              onValueChange={updateField(ProfileDataField.IDENTITY_DOC_ID)}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("personalDetails:form.identityDocCountry.label")}
              </label>
              <select
                value={data[ProfileDataField.IDENTITY_DOC_COUNTRY] as string || "SGP"}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.IDENTITY_DOC_COUNTRY]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {countryList.map(({ countryCode, countryName }) => (
                  <option key={countryCode} value={countryCode}>{countryName}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("personalDetails:form.nationality.label")}
              </label>
              <select
                value={data[ProfileDataField.NATIONALITY] as string || "SGP"}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.NATIONALITY]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {countryList.map(({ countryCode, countryName }) => (
                  <option key={countryCode} value={countryCode}>{countryName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <Button onClick={handleNext} className="w-full">
              {t("common:button.next")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Address
  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="px-5">
        <TopNav allowBack onBack={handleBack} />
        
        <div className="pb-4">
          <H1>{t("personalDetails:heading.address.title")}</H1>
        </div>

        {(error || submitError) && <Alert className="mb-4">{error || submitError}</Alert>}

        <div className="space-y-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("personalDetails:form.residenceCountry.label")}
            </label>
            <select
              value={data[ProfileDataField.RESIDENCE_COUNTRY] as string || "SGP"}
              onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.RESIDENCE_COUNTRY]: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {countryList.map(({ countryCode, countryName }) => (
                <option key={countryCode} value={countryCode}>{countryName}</option>
              ))}
            </select>
          </div>

          <Input
            label={t("personalDetails:form.residenceAddress.label")}
            placeholder={t("personalDetails:form.residenceAddress.placeholder")}
            value={data[ProfileDataField.RESIDENCE_ADDRESS] as string || ""}
            onValueChange={updateField(ProfileDataField.RESIDENCE_ADDRESS)}
          />
          <Input
            label={t("personalDetails:form.residenceUnit.label")}
            placeholder={t("personalDetails:form.residenceUnit.placeholder")}
            value={data[ProfileDataField.RESIDENCE_UNIT] as string || ""}
            onValueChange={updateField(ProfileDataField.RESIDENCE_UNIT)}
          />
          <Input
            label={t("personalDetails:form.residencePostalCode.label")}
            placeholder={t("personalDetails:form.residencePostalCode.placeholder")}
            value={data[ProfileDataField.RESIDENCE_POSTAL_CODE] as string || ""}
            onValueChange={updateField(ProfileDataField.RESIDENCE_POSTAL_CODE)}
          />
          <Input
            label={t("personalDetails:form.residenceCity.label")}
            placeholder={t("personalDetails:form.residenceCity.placeholder")}
            value={data[ProfileDataField.RESIDENCE_CITY] as string || ""}
            onValueChange={updateField(ProfileDataField.RESIDENCE_CITY)}
          />
        </div>

        {/* Mailing Address */}
        <div className="mt-8">
          <H1 className="text-xl">{t("personalDetails:heading.mailingAddress.title")}</H1>
          
          <div className="mt-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data[ProfileDataField.MAILING_USE_RESIDENCE] as boolean || false}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.MAILING_USE_RESIDENCE]: e.target.checked }))}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <span>{t("personalDetails:form.mailUseResidence.label")}</span>
            </label>
          </div>

          {!data[ProfileDataField.MAILING_USE_RESIDENCE] && (
            <div className="space-y-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("personalDetails:form.mailingCountry.label")}
                </label>
                <select
                  value={data[ProfileDataField.MAILING_COUNTRY] as string || "SGP"}
                  onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.MAILING_COUNTRY]: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {countryList.map(({ countryCode, countryName }) => (
                    <option key={countryCode} value={countryCode}>{countryName}</option>
                  ))}
                </select>
              </div>

              <Input
                label={t("personalDetails:form.mailingAddress.label")}
                placeholder={t("personalDetails:form.mailingAddress.placeholder")}
                value={data[ProfileDataField.MAILING_ADDRESS] as string || ""}
                onValueChange={updateField(ProfileDataField.MAILING_ADDRESS)}
              />
              <Input
                label={t("personalDetails:form.mailingUnit.label")}
                placeholder={t("personalDetails:form.mailingUnit.placeholder")}
                value={data[ProfileDataField.MAILING_UNIT] as string || ""}
                onValueChange={updateField(ProfileDataField.MAILING_UNIT)}
              />
              <Input
                label={t("personalDetails:form.mailingPostalCode.label")}
                placeholder={t("personalDetails:form.mailingPostalCode.placeholder")}
                value={data[ProfileDataField.MAILING_POSTAL_CODE] as string || ""}
                onValueChange={updateField(ProfileDataField.MAILING_POSTAL_CODE)}
              />
              <Input
                label={t("personalDetails:form.mailingCity.label")}
                placeholder={t("personalDetails:form.mailingCity.placeholder")}
                value={data[ProfileDataField.MAILING_CITY] as string || ""}
                onValueChange={updateField(ProfileDataField.MAILING_CITY)}
              />
            </div>
          )}
        </div>

        <div className="space-y-3 mt-8">
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            {t("common:button.save")}
          </Button>
          <Button outline onClick={handleBack} className="w-full">
            {t("common:button.back")}
          </Button>
        </div>
      </div>
    </div>
  );
}
