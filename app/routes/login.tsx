import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Input, Alert, TopNav, Link, H1, P, PinField } from "../components";
import { AuthContext } from "../contexts";
import { useAuth } from "../services";
import { validator } from "../utils/validator";
import { mask } from "../utils/mask";
import logoBig from "../assets/images/ascend-logo.svg";
import colors from "../theme/colors";

type View = "login" | "mfa";

const CODE_EXPIRY = 3 * 60 * 1000; // 3 minutes
const INITIAL_VALIDITY_TEXT = "03:00 minutes";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { signIn, confirmMFA, resendMFACode, signInWithSingpass, loading, error: authError } = useAuth();
  
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [submit, setSubmit] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  
  // OTP expiry countdown
  const [verificationCodeExpiry, setVerificationCodeExpiry] = useState<Date | null>(null);
  const [verificationCodeRemainingValidity, setVerificationCodeRemainingValidity] = useState(INITIAL_VALIDITY_TEXT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

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

  const isValidToLogin = () => {
    return [email, password].every(validator.checkNotEmpty) && validator.checkEmail(email);
  };

  const isValidToConfirm = () => {
    return validator.checkLoginVerificationCode(verificationCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToLogin()) return;

    try {
      setSubmit(true);
      setError("");
      
      const result = await signIn(email, password);
      
      if (result.requiresMFA) {
        // MFA required - show verification screen
        setMaskedEmail(mask.maskEmail(email));
        setView("mfa");
        startExpiryCountdown();
        setSubmit(false);
      } else {
        // Direct login success
        navigate("/");
      }
    } catch (e) {
      setSubmit(false);
      if (e instanceof Error) {
        // If user is already authenticated, just navigate to home
        if (e.message.includes("UserAlreadyAuthenticated")) {
          navigate("/");
          return;
        }
        if (e.message.includes("UserNotConfirmedException")) {
          setError(t("login:error.invalidCredentials"));
        } else {
          setError(t("login:error.invalidCredentials"));
        }
      } else {
        setError(t("login:error.invalidCredentials"));
      }
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidToConfirm()) return;

    try {
      setSubmit(true);
      setError("");
      
      await confirmMFA(verificationCode);
      navigate("/");
    } catch (e) {
      setSubmit(false);
      setVerificationCode("");
      
      // Check if it's a profile loading error (not an MFA error)
      // In that case, the auth succeeded, so navigate anyway
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("profile")) {
        // Auth succeeded but profile loading failed - still navigate
        navigate("/");
        return;
      }
      // Error is set by useAuth hook for actual MFA errors
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      await resendMFACode(email, password);
      startExpiryCountdown();
    } catch (e) {
      // Error is set by useAuth hook
    }
  };

  const handleSingpassLogin = async () => {
    try {
      setError("");
      await signInWithSingpass();
    } catch (e) {
      // Error is set by useAuth hook
    }
  };

  // MFA Verification View
  if (view === "mfa") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => setView("login")} />
          
          <div className="pt-4">
            {/* Title */}
            <div className="mb-4">
              <H1>{t("login:heading.title.verification")}</H1>
            </div>

            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

            {/* Instruction */}
            <div className="mb-5">
              <P color="grey700">
                {t("login:text.verificationCodeSent", { email: maskedEmail })}
              </P>
            </div>

            {/* Verification Form */}
            {!submit && (
              <form onSubmit={handleMFASubmit}>
                <div className="mb-8">
                  <PinField
                    label={t("login:form.verificationCode.label")}
                    value={verificationCode}
                    onValueChange={setVerificationCode}
                  />
                  
                  {/* Resend code link */}
                  <div className="flex items-center mt-2">
                    {verificationCodeRemainingValidity ? (
                      <P color="grey500" className="text-sm">
                        <span className="text-gray-400">{t("login:link.resendVerificationCode")} </span>
                        {t("login:form.verificationCode.countdown", { expiry: verificationCodeRemainingValidity })}
                      </P>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-teal-600 font-semibold text-sm"
                      >
                        {t("login:link.resendVerificationCode")}
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isValidToConfirm()}
                  loading={submit || loading}
                  className="w-full"
                >
                  {t("common:button.confirm")}
                </Button>
              </form>
            )}

            {submit && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            )}

            {/* Help links */}
            <div className="text-center mt-6">
              <P color="grey500" className="text-sm mb-1">
                {t("login:text.noReceive")}
              </P>
              <div className="flex items-center justify-center gap-1">
                <span className="text-gray-500 text-xs">{t("common:text.label.or")} </span>
                <Link to="/contact" className="text-sm">{t("login:link.contactUs")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Form View
  return (
    <div className="min-h-screen bg-white">
      <div className="px-5">
        <TopNav allowBack />
        
        <div className="pt-4">
          {/* Logo */}
          <div className="flex justify-center mb-8 mt-2">
            <img 
              src={logoBig} 
              alt="FAM Logo" 
              className="h-40 object-contain"
            />
          </div>

          {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

          {!submit && (
            <form onSubmit={handleSubmit}>
              {/* Form fields */}
              <div className="mb-8">
                <Input
                  label={t("login:form.email.label")}
                  type="email"
                  value={email}
                  onValueChange={(v) => setEmail(v.trim().toLowerCase())}
                  placeholder={t("login:form.email.placeholder")}
                  autoComplete="email"
                />
                <Input
                  label={t("login:form.password.label")}
                  type="password"
                  value={password}
                  onValueChange={(v) => setPassword(v.trim())}
                  placeholder={t("login:form.password.placeholder")}
                  autoComplete="current-password"
                />
              </div>

              {/* Buttons */}
              <div className="mb-4">
                <Button
                  type="submit"
                  disabled={!isValidToLogin()}
                  loading={loading}
                  className="w-full"
                >
                  {t("login:button.login")}
                </Button>
              </div>

              {/* <Button
                type="button"
                outline
                onClick={handleSingpassLogin}
                className="w-full"
                style={{ borderColor: colors.teal500 }}
              >
                <span style={{ color: colors.teal500 }}>{t("login:button.login.with")} </span>
                <span className="text-red-600 font-bold">{t("login:button.login.singpass")}</span>
              </Button> */}
            </form>
          )}

          {submit && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          )}

          {/* Help links */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <Link to="/reset-password">{t("login:link.forgetPassword")}</Link>
            <span className="text-gray-400">{t("common:text.label.or")}</span>
            <Link to="/signup">{t("login:link.signup")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
