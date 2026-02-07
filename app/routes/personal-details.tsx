import { useContext } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, H2, P, Small, TopNav, Link, Card, Skeleton } from "../components";
import { ProfileContext, AuthContext } from "../contexts";
import { ProfileDataField } from "../utils/ProfileDataField";
import dayjs from "dayjs";

const countryNameMap: Record<string, string> = {
  SGP: "Singapore",
  MYS: "Malaysia",
  IDN: "Indonesia",
  USA: "United States",
  GBR: "United Kingdom",
  AUS: "Australia",
  CHN: "China",
  IND: "India",
  JPN: "Japan",
  KOR: "South Korea",
};

const field1List = [
  { key: "name", field: "NAME" },
  { key: "nameFirst", field: "NAME_FIRST" },
  { key: "nameLast", field: "NAME_LAST" },
  { key: "contactMobile", field: "CONTACT_MOBILE" },
  { key: "contactEmail", field: "CONTACT_EMAIL" },
  { key: "dateOfBirth", field: "DATE_OF_BIRTH" },
  { key: "birthCountry", field: "BIRTH_COUNTRY" },
  { key: "identityDocID", field: "IDENTITY_DOC_ID" },
  { key: "identityDocCountry", field: "IDENTITY_DOC_COUNTRY" },
  { key: "nationality", field: "NATIONALITY" },
];

const field2List = [
  { key: "residenceCountry", field: "RESIDENCE_COUNTRY" },
  { key: "residenceCity", field: "RESIDENCE_CITY" },
  { key: "residenceAddress", field: "RESIDENCE_ADDRESS" },
  { key: "residenceUnit", field: "RESIDENCE_UNIT" },
  { key: "residencePostalCode", field: "RESIDENCE_POSTAL_CODE" },
];

const field3List = [
  { key: "mailingCountry", field: "MAILING_COUNTRY" },
  { key: "mailingCity", field: "MAILING_CITY" },
  { key: "mailingAddress", field: "MAILING_ADDRESS" },
  { key: "mailingUnit", field: "MAILING_UNIT" },
  { key: "mailingPostalCode", field: "MAILING_POSTAL_CODE" },
];

const countriesFields = [
  "IDENTITY_DOC_COUNTRY",
  "NATIONALITY", 
  "BIRTH_COUNTRY",
  "RESIDENCE_COUNTRY",
  "MAILING_COUNTRY",
];

export default function PersonalDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);

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
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white">
          <div className="px-5">
            <TopNav allowBack onBack={() => navigate("/profile")} />
            <div className="pb-5">
              <H1>{t("personalDetails:heading.title")}</H1>
            </div>
          </div>
        </div>
        <div className="px-5 pt-5">
          <Skeleton loading={true}>
            <div className="h-64" />
          </Skeleton>
        </div>
      </div>
    );
  }

  const renderField = ({ key, field }: { key: string; field: string }) => {
    const fieldName = ProfileDataField[field as keyof typeof ProfileDataField];
    let value = profile[fieldName as keyof typeof profile] as string | undefined;

    if (value) {
      if (countriesFields.includes(field)) {
        value = countryNameMap[value] || value;
      } else if (field === "DATE_OF_BIRTH") {
        value = dayjs(value).format("D MMMM YYYY");
      }
    } else {
      value = "-";
    }

    return (
      <div key={key} className="mb-4">
        <Small color="grey500" className="block mb-1">
          {t(`personalDetails:form.${key}.label`)}
        </Small>
        <P className="font-semibold">{value}</P>
      </div>
    );
  };

  const isInvestor = profile.investor === true;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white">
        <div className="px-5">
          <TopNav 
            allowBack 
            onBack={() => navigate("/profile")}
            rightContent={
              !isInvestor && (
                <Link to="/personal-details/edit">{t("common:link.edit")}</Link>
              )
            }
          />
          <div className="pb-5">
            <H1>{t("personalDetails:heading.title")}</H1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {isInvestor && (
          <Card className="mb-4 bg-yellow-50 border-yellow-200">
            <P color="grey700">
              {t("personalDetails:text.informationUpdate")}
              {t("personalDetails:text.informationUpdate2")}
              {t("personalDetails:text.informationUpdate3")}
            </P>
          </Card>
        )}

        <Card className="mb-4">
          {field1List.map(renderField)}
        </Card>

        <H2 className="mb-3 mt-6">{t("personalDetails:heading.address.title")}</H2>
        <Card className="mb-4">
          {field2List.map(renderField)}
        </Card>

        <H2 className="mb-3 mt-6">{t("personalDetails:heading.mailingAddress.title")}</H2>
        <Card>
          {profile[ProfileDataField.MAILING_USE_RESIDENCE as keyof typeof profile] ? (
            <P>{t("personalDetails:form.mailUseResidence.label")}</P>
          ) : (
            field3List.map(renderField)
          )}
        </Card>
      </div>
    </div>
  );
}
