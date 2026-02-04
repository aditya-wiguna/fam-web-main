import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button, Input, Alert, TopNav, Link, H1, P, PinField } from "../components";
import { AuthContext } from "../contexts";
import { useAuth } from "../services";
import { validator } from "../utils/validator";
import { mask } from "../utils/mask";
import successImage from "../assets/images/success.png";
import colors from "../theme/colors";
import { IoCheckmarkCircle } from "react-icons/io5";

type Step = "type" | "email" | "password" | "verification" | "autoLogin" | "success";

const CODE_EXPIRY = 3 * 60 * 1000; // 3 minutes
const INITIAL_VALIDITY_TEXT = "03:00 minutes";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { signUp, confirmSignUp, resendSignUpVerificationCode, signIn, loading, error: authError } = useAuth();
  
  const [step, setStep] = useState<Step>("type");
  const [existingClient, setExistingClient] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [submit, setSubmit] = useState(false);

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

  const isValidEmail = () => validator.checkNotEmpty(email) && validator.checkEmail(email);
  
  const isValidPassword = () => {
    const result = validator.checkPasswordRequirement(password);
    const checkPass = result.length === 0 || result.every(({ result }) => result);
    return checkPass && validator.checkEmail(email) && password === confirmPassword;
  };

  const isValidCode = () => validator.checkSignupVerificationCode(verificationCode);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail()) return;

    try {
      setSubmit(true);
      setError("");
      
      // TODO: Check if email is registered with getUnregistered API
      // For now, just proceed to password step
      
      setSubmit(false);
      setStep("password");
    } catch (e) {
      setSubmit(false);
      setError(t("signup:error.signup"));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPassword()) return;

    try {
      setSubmit(true);
      setError("");
      
      // Sign up with AWS Cognito
      await signUp(email, password);
      
      setSubmit(false);
      setStep("verification");
      startExpiryCountdown();
    } catch (e) {
      setSubmit(false);
      // Error is set by useAuth hook
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCode()) return;

    try {
      setSubmit(true);
      setError("");
      
      // Confirm sign up with AWS Cognito
      await confirmSignUp(email, verificationCode);
      
      setSubmit(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Auto login after successful verification
      setStep("autoLogin");
      await performAutoLogin();
    } catch (e) {
      setSubmit(false);
      // Error is set by useAuth hook
    }
  };

  const performAutoLogin = async () => {
    try {
      setSubmit(true);
      setError("");
      
      const result = await signIn(email, password);
      
      setSubmit(false);
      
      if (result.requiresMFA) {
        // If MFA is required, show success and let user login manually
        setStep("success");
      } else {
        // Direct login success - go to profile setup or home
        if (existingClient) {
          // Existing client - linked success
          setStep("success");
        } else {
          // New client - go to profile setup
          navigate("/personal-details");
        }
      }
    } catch (e) {
      setSubmit(false);
      // If auto login fails, show success and let user login manually
      setStep("success");
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
      await resendSignUpVerificationCode(email);
      startExpiryCountdown();
    } catch (e) {
      // Error is set by useAuth hook
    }
  };

  // Step: Choose client type
  if (step === "type") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack />
          
          <div className="pt-4">
            <div className="text-center mb-4">
              <H1>{t("signup:heading.title.tellMore")}</H1>
            </div>

            <div className="mt-12 space-y-3">
              <Button
                onClick={() => { setExistingClient(true); setStep("email"); }}
                className="w-full"
              >
                {t("signup:button.tellMore.existingClient")}
              </Button>
              <Button
                outline
                onClick={() => { setExistingClient(false); setStep("email"); }}
                className="w-full"
              >
                {t("signup:button.tellMore.newClient")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: Enter email
  if (step === "email") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => setStep("type")} />
          
          <div className="pt-4">
            <div className="mb-4">
              <H1>{t("signup:heading.title.signup")}</H1>
            </div>

            {/* Instruction text */}
            <div className="mb-5">
              {!existingClient && (
                <P color="grey700">{t("signup:text.signup.instruction")}</P>
              )}
              {existingClient && (
                <P color="grey700">
                  {t("signup:text.signup.instruction.existingClientPart1")}
                  <span className="font-bold">
                    {t("signup:text.signup.instruction.existingClientPart2")}
                  </span>
                  {t("signup:text.signup.instruction.existingClientPart3")}
                </P>
              )}
            </div>

            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

            {!submit && (
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-8">
                  <Input
                    label={t("signup:form.email.label")}
                    type="email"
                    value={email}
                    onValueChange={(v) => setEmail(v.trim().toLowerCase())}
                    placeholder={t("signup:form.email.placeholder")}
                    autoComplete="email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isValidEmail()}
                  className="w-full"
                >
                  {t("common:button.next")}
                </Button>
              </form>
            )}

            {submit && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            )}

            {/* Help link for existing clients */}
            {existingClient && (
              <div className="flex justify-center items-center gap-1 mt-6">
                <P color="grey500" className="text-sm">{t("signup:text.forgetEmail")}</P>
                <Link to="/contact">{t("signup:link.contactUs")}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step: Enter password
  if (step === "password") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => setStep("email")} />
          
          <div className="pt-4">
            <div className="mb-4">
              <H1>{firstName ? `Hello, ${firstName}` : "Hello"}</H1>
            </div>

            <div className="mb-5">
              <P color="grey700">{t("signup:text.signup.instruction.password")}</P>
            </div>

            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

            {!submit && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-8">
                  <Input
                    label={t("signup:form.password.label")}
                    type="password"
                    value={password}
                    onValueChange={(v) => setPassword(v.trim())}
                    placeholder={t("signup:form.password.placeholder")}
                    helpText={t("signup:form.password.new.help")}
                    autoComplete="new-password"
                  />
                  <Input
                    label={t("signup:form.password.confirm.label")}
                    type="password"
                    value={confirmPassword}
                    onValueChange={(v) => setConfirmPassword(v.trim())}
                    placeholder={t("signup:form.password.confirm.placeholder")}
                    helpText={t("signup:form.password.confirm.help")}
                    autoComplete="new-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!isValidPassword()}
                  loading={loading}
                  className="w-full"
                >
                  {t("signup:button.password.signup")}
                </Button>
              </form>
            )}

            {submit && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            )}

            {/* Login link */}
            <div className="flex justify-center items-center gap-1 mt-6">
              <P color="grey500" className="text-sm">{t("signup:text.password.or")}</P>
              <Link to="/login">{t("signup:text.password.login")}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: Verification code
  if (step === "verification") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav allowBack onBack={() => setStep("password")} />
          
          <div className="pt-4">
            <div className="mb-4">
              <H1>{t("signup:heading.title.verification")}</H1>
            </div>

            <div className="mb-5">
              <P color="grey700">
                {t("signup:text.verificationCodeSent", { email: mask.maskEmail(email) })}
              </P>
            </div>

            {(error || authError) && <Alert className="mb-4">{error || authError}</Alert>}

            {!submit && (
              <form onSubmit={handleVerificationSubmit}>
                <div className="mb-8">
                  <PinField
                    label={t("signup:form.verificationCode.label")}
                    value={verificationCode}
                    onValueChange={setVerificationCode}
                  />
                  
                  {/* Resend code link */}
                  <div className="flex items-center mt-2">
                    {verificationCodeRemainingValidity ? (
                      <P color="grey500" className="text-sm">
                        <span className="text-gray-400">{t("signup:link.resendVerificationCode")} </span>
                        {t("signup:form.verificationCode.countdown", { expiry: verificationCodeRemainingValidity })}
                      </P>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-teal-600 font-semibold text-sm"
                      >
                        {t("signup:link.resendVerificationCode")}
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isValidCode()}
                  loading={loading}
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
                {t("signup:text.noReceive")}
              </P>
              <div className="flex items-center justify-center gap-1">
                <span className="text-gray-500 text-xs">{t("common:text.label.or")} </span>
                <Link to="/contact" className="text-sm">{t("signup:link.contactUs")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: Auto login (loading state)
  if (step === "autoLogin") {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-5">
          <TopNav />
          
          <div className="pt-4 text-center">
            <div className="py-12">
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
              <P color="grey700">Logging you in...</P>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: Success
  return (
    <div className="min-h-screen bg-white">
      <div className="px-5">
        <TopNav />
        
        <div className="pt-4">
          {/* Title */}
          <div className="text-center mb-4">
            <H1>{existingClient ? t("signup:heading.title.success.linked") : t("signup:heading.title.success")}</H1>
          </div>

          {/* Success image and message */}
          <div className="flex flex-col items-center my-12">
            <img 
              src={successImage} 
              alt="Success" 
              className="h-40 object-contain mb-4"
            />
            <P color="grey700" className="text-center">
              {t("signup:text.success.instruction")}
            </P>
          </div>

          {/* Features section */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4">{t("signup:text.feature.title")}</h3>
            <div className="flex items-start gap-2 mb-2">
              <IoCheckmarkCircle size={24} color={colors.success} className="flex-shrink-0 mt-0.5" />
              <P color="grey700">{t("signup:text.feature.products")}</P>
            </div>
          </div>

          {/* Button */}
          <div className="mt-8 mb-8">
            <Button onClick={() => navigate("/")} className="w-full">
              {t("signup:button.feature.products")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
