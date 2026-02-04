import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, TopNav, Card } from "../components";

export default function Privacy() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => navigate(-1)} />
          <div className="pb-5">
            <H1>{t("privacyPolicy:heading.title")}</H1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <Card>
          <div className="prose prose-sm max-w-none">
            <h2 className="text-lg font-semibold mb-4">Privacy Policy</h2>
            
            <h3 className="text-base font-medium mt-4 mb-2">1. Information We Collect</h3>
            <P className="mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              make a transaction, or contact us for support. This may include your name, email address, 
              phone number, identification documents, and financial information.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">2. How We Use Your Information</h3>
            <P className="mb-4">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, send you technical notices and support messages, and respond 
              to your comments and questions.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">3. Information Sharing</h3>
            <P className="mb-4">
              We do not share your personal information with third parties except as described in 
              this policy. We may share information with vendors, consultants, and other service 
              providers who need access to such information to carry out work on our behalf.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">4. Data Security</h3>
            <P className="mb-4">
              We take reasonable measures to help protect information about you from loss, theft, 
              misuse, unauthorized access, disclosure, alteration, and destruction. All data is 
              encrypted in transit and at rest.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">5. Data Retention</h3>
            <P className="mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes 
              for which it was collected, including to satisfy any legal, accounting, or reporting 
              requirements.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">6. Your Rights</h3>
            <P className="mb-4">
              You have the right to access, correct, or delete your personal information. You may 
              also have the right to restrict or object to certain processing of your information. 
              To exercise these rights, please contact us.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">7. Contact Us</h3>
            <P className="mb-4">
              If you have any questions about this Privacy Policy, please contact us through the 
              support section of the application.
            </P>
          </div>
        </Card>
      </div>
    </div>
  );
}
