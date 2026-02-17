import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, Button, Input, TopNav, Alert, Skeleton } from "../components";
import { ProfileContext, AuthContext } from "../contexts";
import { ProfileDataField } from "../utils/ProfileDataField";
import { useProfileService } from "../services/useProfileService";
import { useFormTemplateService, FormTemplateKey, type FormTemplate } from "../services";

const SingaporeCountryCode = "SGP";

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
];

const SourceOfFundsDefaultOptions = [
  { label: "Employment", value: "employment" },
  { label: "Investment", value: "investment" },
  { label: "Own Business", value: "own_business" },
  { label: "Rental", value: "rental" },
  { label: "Others", value: "others" },
];

const SourceOfWealthDefaultOptions = [
  { label: "Employment", value: "employment" },
  { label: "Investment", value: "investment" },
  { label: "Own Business", value: "own_business" },
  { label: "Rental", value: "rental" },
  { label: "Others", value: "others" },
];

const EmploymentStatusDefaultOptions = [
  { label: "Employed", value: "employed" },
  { label: "Self-employed", value: "self_employed" },
  { label: "Unemployed", value: "unemployed" },
  { label: "Home Maker", value: "home_maker" },
  { label: "Retired", value: "retired" },
];

export default function DeclarationsEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile, updateProfileData } = useContext(ProfileContext);
  const { saveDeclarationInfo, get, loading, error } = useProfileService();
  const { getLatestPublished, loading: templateLoading, error: templateError } = useFormTemplateService();
  
  const [data, setData] = useState<Record<string, unknown>>({});
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (profile) {
      setData({ ...profile });
    }
  }, [profile]);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const template = await getLatestPublished(FormTemplateKey.ClientDeclarationPersonalInfoForm);
        setFormTemplate(template);
      } catch (e) {
        console.error("Error loading form template", e);
      }
    }
    loadTemplate();
  }, [getLatestPublished]);

  const getFormOptions = (referenceId: string, defaultOptions: Array<{ label: string; value: string }>) => {
    if (!formTemplate?.form?.questions) return defaultOptions;
    
    const question = formTemplate.form.questions.find(
      (q: { outputReferenceId?: string }) => q.outputReferenceId === referenceId
    );
    
    if (question?.answerConfig?.options) {
      return question.answerConfig.options.map((o: { config: { label: string; value: string } }) => ({
        label: o.config.label,
        value: o.config.value,
      }));
    }
    
    return defaultOptions;
  };

  const handleBack = () => {
    navigate("/declarations");
  };

  const handleSubmit = async () => {
    try {
      setSubmitError("");
      
      const customerId = profile?.id || data.id as string;
      if (!customerId) {
        setSubmitError("Unable to save: customer ID not found. Please try logging out and back in.");
        return;
      }
      
      await saveDeclarationInfo(customerId, data);
      
      const userId = profile?.userId || data.userId || user?.userId;
      if (userId) {
        const updatedProfile = await get(userId as string);
        updateProfileData(updatedProfile);
      }
      navigate("/declarations");
    } catch (e) {
      console.error("Error saving declaration", e);
      setSubmitError(t("common:error.declaration.save"));
    }
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
          <TopNav allowBack onBack={() => navigate("/declarations")} />
          <div className="pb-4">
            <H1>{t("declaration:heading.title")}</H1>
          </div>
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        </div>
      </div>
    );
  }

  const employmentOptions = getFormOptions("employment_status", EmploymentStatusDefaultOptions);
  const sourceOfWealthOptions = getFormOptions("source_of_wealth", SourceOfWealthDefaultOptions);
  const sourceOfFundsOptions = getFormOptions("source_of_funds", SourceOfFundsDefaultOptions);

  // Get tax residence country
  const taxResidenceCountry = data[ProfileDataField.SINGAPORE_TAX_RESIDENCE] 
    ? SingaporeCountryCode 
    : data[ProfileDataField.TAX_COUNTRY] as string;

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="px-5">
        <TopNav allowBack onBack={handleBack} />
        
        <div className="pb-4">
          <H1>{t("declaration:heading.title")}</H1>
        </div>

        <div className="mb-6">
          <P color="grey700">{t("personalDetails:text.instruction")}</P>
        </div>

        {(error || templateError || submitError) && (
          <Alert className="mb-4">{error || templateError || submitError}</Alert>
        )}

        {templateLoading ? (
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        ) : (
          <div className="space-y-4">
            {/* US Person */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("declaration:form.usPerson.label")}
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, [ProfileDataField.US_PERSON]: true }))}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    data[ProfileDataField.US_PERSON] === true
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {t("common:text.label.yes")}
                </button>
                <button
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, [ProfileDataField.US_PERSON]: false }))}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    data[ProfileDataField.US_PERSON] === false
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {t("common:text.label.no")}
                </button>
              </div>
            </div>

            {/* Employment Status */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("declaration:form.employmentStatus.label")}
              </label>
              <select
                value={data[ProfileDataField.EMPLOYMENT_STATUS] as string || ""}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.EMPLOYMENT_STATUS]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">{t("declaration:form.employmentStatus.placeholder")}</option>
                {employmentOptions.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Source of Wealth */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("declaration:form.sourceOfWealth.label")}
              </label>
              <select
                value={data[ProfileDataField.SOURCE_OF_WEALTH] as string || ""}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.SOURCE_OF_WEALTH]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">{t("declaration:form.sourceOfWealth.placeholder")}</option>
                {sourceOfWealthOptions.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Source of Funds */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("declaration:form.sourceOfFund.label")}
              </label>
              <select
                value={data[ProfileDataField.SOURCE_OF_FUND] as string || ""}
                onChange={(e) => setData(prev => ({ ...prev, [ProfileDataField.SOURCE_OF_FUND]: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">{t("declaration:form.sourceOfFund.placeholder")}</option>
                {sourceOfFundsOptions.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Tax Residence Country */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("declaration:form.taxCountry.label")}
              </label>
              <select
                value={taxResidenceCountry || ""}
                onChange={(e) => {
                  const countryValue = e.target.value;
                  if (countryValue === SingaporeCountryCode) {
                    setData(prev => ({
                      ...prev,
                      [ProfileDataField.SINGAPORE_TAX_RESIDENCE]: true,
                      [ProfileDataField.TAX_COUNTRY]: null,
                      [ProfileDataField.TAX_RESIDENCE_ID]: null,
                    }));
                  } else {
                    setData(prev => ({
                      ...prev,
                      [ProfileDataField.SINGAPORE_TAX_RESIDENCE]: false,
                      [ProfileDataField.TAX_COUNTRY]: countryValue,
                    }));
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">{t("declaration:form.taxCountry.placeholder")}</option>
                {countryList.map(({ countryCode, countryName }) => (
                  <option key={countryCode} value={countryCode}>{countryName}</option>
                ))}
              </select>
            </div>

            {/* Tax ID (only if not Singapore) */}
            {!data[ProfileDataField.SINGAPORE_TAX_RESIDENCE] && taxResidenceCountry && (
              <Input
                label={t("declaration:form.tin.label")}
                placeholder={t("declaration:form.tin.placeholder")}
                value={data[ProfileDataField.TAX_RESIDENCE_ID] as string || ""}
                onValueChange={(val) => setData(prev => ({ ...prev, [ProfileDataField.TAX_RESIDENCE_ID]: val }))}
              />
            )}
          </div>
        )}

        <div className="space-y-3 mt-8">
          <Button onClick={handleSubmit} loading={loading} className="w-full">
            {t("common:button.save")}
          </Button>
          <Button outline onClick={handleBack} className="w-full">
            {t("common:button.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
