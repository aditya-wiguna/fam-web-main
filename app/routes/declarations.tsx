import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, Small, TopNav, Link, Card, Skeleton, Alert } from "../components";
import { ProfileContext } from "../contexts";
import { ProfileDataField } from "../utils/ProfileDataField";
import { useFormTemplateService, FormTemplateKey, type FormTemplate } from "../services";

const countryNameMap: Record<string, string> = {
  SGP: "Singapore",
  MYS: "Malaysia",
  IDN: "Indonesia",
  USA: "United States",
  GBR: "United Kingdom",
  AUS: "Australia",
};

const fieldList = [
  { key: "usPerson", field: "US_PERSON" },
  { key: "employmentStatus", field: "EMPLOYMENT_STATUS", formField: "employment_status" },
  { key: "sourceOfWealth", field: "SOURCE_OF_WEALTH", formField: "source_of_wealth" },
  { key: "sourceOfFund", field: "SOURCE_OF_FUND", formField: "source_of_funds" },
  { key: "taxCountry", field: "TAX_COUNTRY" },
  { key: "tin", field: "TAX_RESIDENCE_ID" },
];

export default function Declarations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useContext(ProfileContext);
  const { getLatestPublished, loading, error } = useFormTemplateService();
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null);

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

  if (!profile) {
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

  const renderField = ({ key, field, formField }: { key: string; field: string; formField?: string }) => {
    const fieldName = ProfileDataField[field as keyof typeof ProfileDataField];
    let value = profile[fieldName as keyof typeof profile] as string | boolean | undefined;

    if (field === "TAX_COUNTRY") {
      if (profile[ProfileDataField.SINGAPORE_TAX_RESIDENCE as keyof typeof profile]) {
        value = countryNameMap.SGP;
      } else if (typeof value === "string" && countryNameMap[value]) {
        value = countryNameMap[value];
      } else {
        value = "-";
      }
    } else if (value !== undefined && value !== null && value !== "") {
      if (field === "US_PERSON") {
        value = value ? t("common:text.label.yes") : t("common:text.label.no");
      } else if (formField && formTemplate?.form?.questions) {
        const question = formTemplate.form.questions.find(
          (q: { outputReferenceId?: string }) => q.outputReferenceId === formField
        );
        if (question?.answerConfig?.options) {
          const options = question.answerConfig.options.map((o: { config: unknown }) => o.config) as Array<{ value?: string; label?: string }>;
          const selectedOption = options.find(
            (opt) => opt.value === value
          );
          if (selectedOption?.label) {
            value = selectedOption.label;
          }
        }
      }
    } else {
      value = "-";
    }

    return (
      <div key={key} className="mb-4">
        <Small color="grey500" className="block mb-1">
          {t(`declaration:form.${key}.label`)}
        </Small>
        <P className="font-semibold">{String(value)}</P>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white">
        <div className="px-5">
          <TopNav 
            allowBack 
            onBack={() => navigate("/profile")}
            rightContent={
              <Link to="/declarations/edit">{t("common:link.edit")}</Link>
            }
          />
          <div className="pb-5">
            <H1>{t("declaration:heading.title")}</H1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {error && <Alert className="mb-4">{error}</Alert>}
        
        {loading ? (
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        ) : (
          <Card>
            {fieldList.map(renderField)}
          </Card>
        )}
      </div>
    </div>
  );
}
