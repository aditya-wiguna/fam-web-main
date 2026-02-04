import { useTranslation } from "react-i18next";
import { H2, P, Card, TopNav } from "../components";
import { IoMailOutline, IoLogoWhatsapp, IoLocationOutline } from "react-icons/io5";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5">
        <TopNav allowBack />
        
        <H2 className="mb-2">{t("contactSupport:heading.title")}</H2>
        <P color="grey600" className="mb-6">{t("contactSupport:heading.description")}</P>

        <div className="space-y-4">
          <Card>
            <a
              href={`mailto:${t("contactSupport:link.email")}`}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <IoMailOutline size={24} className="text-teal-700" />
              </div>
              <div>
                <P className="font-semibold">Email</P>
                <P color="teal700">{t("contactSupport:link.email")}</P>
              </div>
            </a>
          </Card>

          <Card>
            <a
              href={`https://wa.me/${t("contactSupport:link.whatsapp.number")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <IoLogoWhatsapp size={24} className="text-green-600" />
              </div>
              <div>
                <P className="font-semibold">WhatsApp</P>
                <P color="green">{t("contactSupport:link.whatsapp")}</P>
              </div>
            </a>
          </Card>

          <Card>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <IoLocationOutline size={24} className="text-gray-600" />
              </div>
              <div>
                <P className="font-semibold">Address</P>
                <P color="grey600">{t("contactSupport:link.address")}</P>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
