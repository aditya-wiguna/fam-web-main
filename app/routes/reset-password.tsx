import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Input, Alert, TopNav, Link, H1, P, PinField } from "../components";
import { validator } from "../utils/validator";
import { mask } from "../utils/mask";
import { useAuth } from "../services";

type Step = "email" | "code" | "password" | "success";

const CODE_EXPIRY = 3 * 60 * 1000; // 3 minutes
const INITIAL_VALIDITY_TEXT = "03:00 minutes";

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { forgotPassword, forgotPasswordSubmit, loading, error: authError } = useAuth();
  
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submit, setSubmit] = useState(false);

  // OTP expiry countdown
  const [verificationCodeExpiry, setVerificationCodeExpiry] = useState<Date | null>(null);
  const [verificationCodeRemainingValidity, setVerificationCodeRemainingValidity] = useState(INITIAL_VALIDITY_TEXT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (verificationCodeExpiry) {
      timerRef.current = setInterval(() => {
        const expiryInMilliseconds = verificationCodeExpiry.getTime() - new Date().getTime();

        if (expiryInMilliseconds <= 0) {
          setVerificationCodeExpiry(null);
          setVerificationCodeRemainingValidity("");
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          let remainingText = "";
          if (expiryInMilliseconds <= 90 * 1000) {
            remainingText = Math.floor(expiryInMilliseconds / 1000) + "s";
          } else {
            const minutes = Math.floor((expiryInMilliseconds / (1000 * 60)) % 60);
            const seconds = Math.floor((expiryInMilliseconds / 1000) % 60);
            remainingText = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds} minutes`;
          }
          setVerificationCodeRemainingValidity(remainingText);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [verificationCodeExpiry]);

  const startExpiryCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVerificationCodeRemainingValidity(INITIAL_VALIDITY_TEXT);
    setVerificationCodeExpiry(new Date(Date.now() + CODE_EXPIRY));
  }, []);

  const isValidEmail = () => validator.checkNotEmpty(email) && validator.checkEmail(email);
  const isValidCode = () => validator.checkResetPasswordVerificationCode(code);
  const isValidPassword = () => {
    const result = validator.checkPasswordRequirement(password);
    const checkPass = result.length === 0 || result.every(({ result }) => result);
    return checkPass && password === confirmPassword;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail()) return;
    
    try {
      setSubmit(true);
      setError("");
      
      // Send forgot password request to AWS Cognito
      await forgotPassword(email);
      
      setSubmit(false);
      setStep("code");
      startExpiryCountdown();
    } catch (e) {
      setSubmit(false);
      // Error is set by useAuth hook
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCode()) return;
    
    // Cognito API needs verification code and password to be sent together
    // So just continue to the next screen
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword()) return;
    
    try {
      setSubmit(true);
      setError("");
      
      // Submit new password to AWS Cognito
      await forgotPasswordSubmit(email, code, password);
      
      setSubmit(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setStep("success");
    } catch (e) {
      setSubmit(false);
      
      // If code is invalid, go back to code step
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("CodeMismatchException")) {
        setStep("code");
      }
      // Error is set by useAuth hook
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      await forgotPassword(email);
      startExpiryCountdown();
    } catch (e) {
      // Error is set by useAuth hook
    }
  };

  if (step === "success") {
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
              <H1 className="mb-4">{t("resetPassword:text.success")}</H1>
              <Button onClick={() => navigate("/login")} className="w-full mt-8">
                {t("resetPassword:button.back")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "email") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack />
          <div className="pt-4">
            <div className="mb-4">
              <H1>{t("resetPassword:heading.title.reset")}</H1>
            </div>
            <div className="mb-5">
              <P color="grey700">{t("resetPassword:text.email.instruction")}</P>
            </div>
            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}
            {!submit && (
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-8">
                  <Input
                    label={t("resetPassword:form.email.label")}
                    type="email"
                    value={email}
                    onValueChange={(v) => setEmail(v.trim().toLowerCase())}
                    placeholder={t("resetPassword:form.email.placeholder")}
                    autoComplete="email"
                  />
                </div>
                <div className="mt-8 mb-8">
                  <Button type="submit" disabled={!isValidEmail()} loading={loading} className="w-full">
                    {t("common:button.continue")}
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

  if (step === "code") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => setStep("email")} />
          <div className="pt-4">
            <div className="mb-4">
              <H1>{t("resetPassword:heading.title.otp")}</H1>
            </div>
            <div className="mb-5">
              <P color="grey700">
                {t("resetPassword:text.code.instruction", { email: mask.maskEmail(email) })}
              </P>
            </div>
            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}
            {!submit && (
              <form onSubmit={handleCodeSubmit}>
                <div className="mb-8">
                  <PinField label={t("resetPassword:form.verificationCode.label")} value={code} onValueChange={setCode} />
                  <div className="flex items-center mt-2">
                    {verificationCodeRemainingValidity ? (
                      <P color="grey500" className="text-sm">
                        <span className="text-gray-400">{t("resetPassword:link.resendVerificationCode")} </span>
                        {t("resetPassword:form.verificationCode.countdown", { expiry: verificationCodeRemainingValidity })}
                      </P>
                    ) : (
                      <button type="button" onClick={handleResendCode} className="text-teal-600 font-semibold text-sm">
                        {t("resetPassword:link.resendVerificationCode")}
                      </button>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={!isValidCode()} className="w-full">
                  {t("common:button.confirm")}
                </Button>
              </form>
            )}
            {submit && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            )}
            <div className="text-center mt-6">
              <P color="grey500" className="text-sm mb-1">{t("resetPassword:text.noReceive")}</P>
              <div className="flex items-center justify-center gap-1">
                <span className="text-gray-500 text-xs">{t("common:text.label.or")} </span>
                <Link to="/contact" className="text-sm">{t("resetPassword:link.contactUs")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5">
        <TopNav allowBack onBack={() => setStep("code")} />
        <div className="pt-4">
          <div className="mb-4">
            <H1>{t("resetPassword:heading.title.changePassword")}</H1>
          </div>
          <div className="mb-5">
            <P color="grey700">{t("resetPassword:text.password.instruction")}</P>
          </div>
          {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}
          {!submit && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-8">
                <Input
                  label={t("resetPassword:form.password.new.label")}
                  type="password"
                  value={password}
                  onValueChange={setPassword}
                  placeholder={t("resetPassword:form.password.new.placeholder")}
                  helpText={t("resetPassword:form.password.new.help")}
                  autoComplete="new-password"
                />
                <Input
                  label={t("resetPassword:form.password.confirm.label")}
                  type="password"
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  placeholder={t("resetPassword:form.password.confirm.placeholder")}
                  helpText={t("resetPassword:form.password.confirm.help")}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={!isValidPassword()} loading={loading} className="w-full">
                {t("common:button.submit")}
              </Button>
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
