import { useState, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { 
  signIn as amplifySignIn, 
  signUp as amplifySignUp, 
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  updatePassword,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignIn,
  signInWithRedirect,
} from "@aws-amplify/auth";
import { AuthContext, ProfileContext, type Profile } from "../contexts";
import { useProfileService } from "./useProfileService";
import { usePortfolioService } from "./usePortfolioService";
import { useRiskProfileService } from "./useRiskProfileService";

// Storage keys
const USER_KEY = "fam_user";

// Types for auth data
interface AuthUser {
  userId: string;
  username: string;
  signInDetails?: {
    loginId?: string;
  };
}

interface ChallengeUser {
  nextStep: {
    signInStep: string;
    codeDeliveryDetails?: {
      destination?: string;
      deliveryMedium?: string;
    };
  };
}

export function useAuth() {
  const { t } = useTranslation();
  const { updateAuthData } = useContext(AuthContext);
  const { updateProfileData, updateRiskProfileData } = useContext(ProfileContext);
  const { get: getProfile } = useProfileService();
  const { getSummaryTypes, getLatestSummary, getDetails } = usePortfolioService();
  const { get: getRiskProfile } = useRiskProfileService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<{ user?: AuthUser; challengeUser?: ChallengeUser; requiresMFA: boolean }> => {
    try {
      setError("");
      setLoading(true);
      
      const result = await amplifySignIn({
        username: email,
        password,
        options: {
          authFlowType: "CUSTOM_WITH_SRP",
        },
      });

      setLoading(false);

      // Check if MFA is required
      if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE") {
        return {
          challengeUser: result as unknown as ChallengeUser,
          requiresMFA: true,
        };
      }

      // Sign in successful
      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user ID from token
        const idToken = session.tokens?.idToken;
        const userId = idToken?.payload?.["x-user-id"] as string;

        if (userId) {
          // Load user profile
          await loadUserProfile(userId);
        }

        await updateAuthData({
          userId: currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || email,
        });

        return {
          user: currentUser as AuthUser,
          requiresMFA: false,
        };
      }

      throw new Error("Sign in failed");
      
    } catch (e) {
      console.error("Sign in error", e);
      setError(t("login:error.invalidCredentials"));
      setLoading(false);
      throw e;
    }
  }, [t, updateAuthData]);

  // Confirm MFA challenge
  const confirmMFA = useCallback(async (code: string): Promise<AuthUser> => {
    try {
      setError("");
      setLoading(true);

      const result = await confirmSignIn({
        challengeResponse: code,
      });

      if (result.isSignedIn) {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user ID from token
        const idToken = session.tokens?.idToken;
        const userId = idToken?.payload?.["x-user-id"] as string;

        // Try to load profile but don't fail if it errors (e.g., CORS issues in dev)
        if (userId) {
          try {
            await loadUserProfile(userId);
          } catch (profileError) {
            console.warn("Could not load profile, continuing with auth:", profileError);
          }
        }

        await updateAuthData({
          userId: currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId,
        });

        setLoading(false);
        return currentUser as AuthUser;
      }

      setLoading(false);
      throw new Error("MFA confirmation failed");
    } catch (e) {
      console.error("MFA confirmation error", e);
      setLoading(false);
      
      // Only show error if it's actually an MFA error, not a profile loading error
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("retries")) {
        setError(t("login:error.invalidRetries"));
        throw e;
      } else if (errorMessage.includes("session")) {
        setError(t("login:error.invalidSession"));
        throw e;
      } else if (errorMessage.includes("MFA") || errorMessage.includes("challenge") || errorMessage.includes("code")) {
        setError(t("login:error.invalidCode"));
        throw e;
      }
      
      // If it's a different error (like profile loading), don't block login
      throw e;
    }
  }, [t, updateAuthData]);

  // Resend MFA code (re-sign in to trigger new code)
  const resendMFACode = useCallback(async (email: string, password: string) => {
    try {
      setError("");
      await amplifySignIn({
        username: email,
        password,
        options: {
          authFlowType: "CUSTOM_WITH_SRP",
        },
      });
    } catch (e) {
      console.error("Resend MFA code error", e);
      setError(t("login:error.unableToResendCode"));
      throw e;
    }
  }, [t]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError("");
      setLoading(true);
      
      const result = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      setLoading(false);
      return result;
    } catch (e) {
      console.error("Sign up error", e);
      setLoading(false);
      
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("InvalidParameterException")) {
        setError(t("signup:error.invalidEmail"));
      } else if (errorMessage.includes("UsernameExistsException")) {
        setError(t("signup:error.emailExists"));
      } else {
        setError(t("signup:error.signup"));
      }
      throw e;
    }
  }, [t]);

  // Confirm sign up with verification code
  const confirmSignUp = useCallback(async (email: string, code: string) => {
    try {
      setError("");
      setLoading(true);
      
      const result = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });

      setLoading(false);
      return result;
    } catch (e) {
      console.error("Confirm sign up error", e);
      setError(t("signup:error.invalidCode"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  // Resend sign up verification code
  const resendSignUpVerificationCode = useCallback(async (email: string) => {
    try {
      setError("");
      await resendSignUpCode({
        username: email,
      });
    } catch (e) {
      console.error("Resend sign up code error", e);
      setError(t("signup:error.unableToResendCode"));
      throw e;
    }
  }, [t]);

  // Forgot password - send reset code
  const forgotPassword = useCallback(async (email: string) => {
    try {
      setError("");
      setLoading(true);
      
      const result = await resetPassword({
        username: email,
      });

      setLoading(false);
      return result;
    } catch (e) {
      console.error("Forgot password error", e);
      setError(t("resetPassword:error.invalidEmail"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  // Confirm forgot password with code and new password
  const forgotPasswordSubmit = useCallback(async (email: string, code: string, newPassword: string) => {
    try {
      setError("");
      setLoading(true);
      
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      setLoading(false);
      return true;
    } catch (e) {
      console.error("Forgot password submit error", e);
      setLoading(false);
      
      const errorMessage = e instanceof Error ? e.message : "";
      if (errorMessage.includes("CodeMismatchException")) {
        setError(t("resetPassword:error.invalidCode"));
      } else {
        setError(t("resetPassword:error.unableToResetPassword"));
      }
      throw e;
    }
  }, [t]);

  // Change password for authenticated user
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      setError("");
      setLoading(true);
      
      await updatePassword({
        oldPassword,
        newPassword,
      });

      setLoading(false);
      return true;
    } catch (e) {
      console.error("Change password error", e);
      setError(t("changePassword:error.unableToChangePassword"));
      setLoading(false);
      throw e;
    }
  }, [t]);

  // Sign in with Singpass (federated sign in)
  const signInWithSingpass = useCallback(async () => {
    try {
      setError("");
      await signInWithRedirect({
        provider: {
          custom: "singpass-connector",
        },
      });
    } catch (e) {
      console.error("Singpass sign in error", e);
      setError(t("login:error.singpass.notLinked"));
      throw e;
    }
  }, [t]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      await amplifySignOut();
      
      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_KEY);
      }
      
      await updateAuthData(null);
      setLoading(false);
    } catch (e) {
      console.error("Sign out error", e);
      setLoading(false);
    }
  }, [updateAuthData]);

  // Load user profile data
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      
      if (profile?.id) {
        // Load portfolio and risk profile in parallel
        const [portfolioSummaryTypes, portfolioSummary, portfolio, riskProfile] = await Promise.all([
          getSummaryTypes(profile.id).catch(() => []),
          getLatestSummary(profile.id).catch(() => ({})),
          getDetails(profile.id).catch(() => []),
          getRiskProfile(profile.id).catch(() => null),
        ]);

        await updateProfileData(profile as Profile);
        await updateRiskProfileData(riskProfile);
        
        return { profile, portfolioSummaryTypes, portfolioSummary, portfolio, riskProfile };
      }
      
      return null;
    } catch (e) {
      console.error("Error loading user profile", e);
      throw e;
    }
  }, [getProfile, getSummaryTypes, getLatestSummary, getDetails, getRiskProfile, updateProfileData, updateRiskProfileData]);

  // Check current auth state
  const checkAuthState = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // Get user ID from token
      const idToken = session.tokens?.idToken;
      const userId = idToken?.payload?.["x-user-id"] as string;

      if (userId) {
        await loadUserProfile(userId);
      }

      await updateAuthData({
        userId: currentUser.userId,
        username: currentUser.username,
        email: currentUser.signInDetails?.loginId,
      });

      return currentUser;
    } catch (e) {
      // User is not authenticated
      console.log("No authenticated user");
      return null;
    }
  }, [updateAuthData, loadUserProfile]);

  return {
    signIn,
    confirmMFA,
    resendMFACode,
    signUp,
    confirmSignUp,
    resendSignUpVerificationCode,
    forgotPassword,
    forgotPasswordSubmit,
    changePassword,
    signInWithSingpass,
    signOut,
    loadUserProfile,
    checkAuthState,
    loading,
    error,
  };
}

export default useAuth;
