import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, TopNav, Card } from "../components";

export default function Terms() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => navigate(-1)} />
          <div className="pb-5">
            <H1>{t("termsConditions:heading.title")}</H1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <Card>
          <div className="prose prose-sm max-w-none">
            <h2 className="text-lg font-semibold mb-4">Terms and Conditions</h2>
            
            <h3 className="text-base font-medium mt-4 mb-2">1. Acceptance of Terms</h3>
            <P className="mb-4">
              By accessing and using this application, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">2. Use License</h3>
            <P className="mb-4">
              Permission is granted to temporarily use this application for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">3. Investment Risks</h3>
            <P className="mb-4">
              All investments carry risk. The value of investments and the income from them can go 
              down as well as up and you may not get back the amount originally invested. Past 
              performance is not a reliable indicator of future results.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">4. Disclaimer</h3>
            <P className="mb-4">
              The materials on this application are provided on an 'as is' basis. We make no 
              warranties, expressed or implied, and hereby disclaim and negate all other warranties 
              including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or 
              other violation of rights.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">5. Limitations</h3>
            <P className="mb-4">
              In no event shall we or our suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on this application.
            </P>

            <h3 className="text-base font-medium mt-4 mb-2">6. Governing Law</h3>
            <P className="mb-4">
              These terms and conditions are governed by and construed in accordance with the laws 
              of Singapore and you irrevocably submit to the exclusive jurisdiction of the courts 
              in that location.
            </P>
          </div>
        </Card>
      </div>
    </div>
  );
}
