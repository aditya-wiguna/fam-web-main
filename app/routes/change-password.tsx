import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { H1, P, Button, Input, TopNav, Alert } from "../components";
import { useAuth } from "../services";
import { validator } from "../utils/validator";

export default function ChangePassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changePassword, loading, error: authError } = useAuth();
  
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submit, setSubmit] = useState(false);

  const isValidToChange = () => {
    const result = validator.checkPasswordRequirement(newPassword);
    const checkPass = result.length === 0 || result.every(({ result }) => result);
    return checkPass && password.length > 0 && newPassword === confirmNewPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToChange()) return;

    try {
      setSubmit(true);
      setError("");
      await changePassword(password, newPassword);
      setSubmit(false);
      setSuccess(true);
    } catch (e) {
      setSubmit(false);
      setError(t("changePassword:error.unableToChangePassword"));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav />
          
          <div className="pt-4 text-center">
            <div className="py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <H1 className="mb-4">{t("changePassword:heading.success")}</H1>
              <P color="grey700" className="mb-6">{t("changePassword:text.success")}</P>
              <Button onClick={() => navigate("/profile")} className="w-full">
                {t("changePassword:button.back")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5">
        <TopNav allowBack onBack={() => navigate("/profile")} />
        
        <div className="pt-4">
          {/* Title */}
          <div className="mb-4">
            <H1>{t("changePassword:heading.title")}</H1>
          </div>

          {/* Instruction */}
          <div className="mb-5">
            <P color="grey700">{t("changePassword:text.password.instruction")}</P>
          </div>

          {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

          {!submit && (
            <form onSubmit={handleSubmit}>
              {/* Form fields */}
              <div className="mb-8">
                <Input
                  label={t("changePassword:form.password.label")}
                  type="password"
                  value={password}
                  onValueChange={(v) => setPassword(v.trim())}
                  placeholder={t("changePassword:form.password.placeholder")}
                  autoComplete="current-password"
                />
                <Input
                  label={t("changePassword:form.password.new.label")}
                  type="password"
                  value={newPassword}
                  onValueChange={(v) => setNewPassword(v.trim())}
                  placeholder={t("changePassword:form.password.new.placeholder")}
                  helpText={t("changePassword:form.password.new.help")}
                  autoComplete="new-password"
                />
                <Input
                  label={t("changePassword:form.password.confirm.label")}
                  type="password"
                  value={confirmNewPassword}
                  onValueChange={(v) => setConfirmNewPassword(v.trim())}
                  placeholder={t("changePassword:form.password.confirm.placeholder")}
                  helpText={t("changePassword:form.password.confirm.help")}
                  autoComplete="new-password"
                />
              </div>

              {/* Button */}
              <div className="mt-8 mb-8">
                <Button
                  type="submit"
                  disabled={!isValidToChange()}
                  loading={loading}
                  className="w-full"
                >
                  {t("common:button.save")}
                </Button>
              </div>
            </form>
          )}

          {submit && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
