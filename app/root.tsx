import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useState, useCallback, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { getCurrentUser, fetchAuthSession } from "@aws-amplify/auth";
import type { Route } from "./+types/root";
import "./app.css";
import "./i18n/i18n";
import amplifyConfig from "./config/amplify.config";
import { MobileWrapper } from "./components/MobileWrapper";
import {
  AuthContext,
  ProfileContext,
  UIContext,
  EnvironmentContext,
  type User,
  type Profile,
  type PortfolioSummary,
  type PortfolioItem,
  type RiskProfile,
} from "./contexts";
import { validator } from "./utils/validator";

// Configure Amplify at module load time (before any components render)
Amplify.configure(amplifyConfig);

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" },
  { rel: "manifest", href: "/manifest.json" }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#10368c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tier, setTier] = useState(0);
  const [portfolioSummaryTypes, setPortfolioSummaryTypes] = useState<unknown[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [uiState, setUiState] = useState<Record<string, unknown>>({});
  const [devMode, setDevMode] = useState(false);

  const updateProfileData = useCallback(async (profileData: Profile | null) => {
    let newTier = 0;
    if (profileData) {
      if (profileData.investor && profileData.investorId) {
        newTier = 3;
      } else if (validator.checkClientProfileComplete(profileData as Record<string, unknown>)) {
        newTier = 2;
      } else {
        newTier = 1;
      }
    }
    setTier(newTier);
    setProfile(profileData);
  }, []);

  const updateRiskProfileData = useCallback(async (riskProfileData: unknown) => {
    console.log("updateRiskProfileData called with:", riskProfileData);
    
    if (riskProfileData && typeof riskProfileData === "object") {
      const data = riskProfileData as { 
        formTemplate?: { form?: { riskProfiles?: Array<{
          id?: string;
          name?: string;
          description?: unknown;
          investmentObjective?: unknown;
          riskTolerance?: unknown;
          riskRating?: string[];
          scoreAssignment?: { min: number; max: number };
        }> } }; 
        riskScore?: number; 
        templateId?: string;
        id?: string;
      };
      
      const riskProfiles = data.formTemplate?.form?.riskProfiles || [];
      console.log("Risk profiles from template:", riskProfiles);
      console.log("Risk score:", data.riskScore);
      
      let selectedProfile = null;
      if (riskProfiles.length > 0 && data.riskScore !== undefined) {
        selectedProfile = riskProfiles.find(
          (profile) => {
            if (!profile.scoreAssignment) return false;
            const { min, max } = profile.scoreAssignment;
            return data.riskScore! >= min && data.riskScore! <= max;
          }
        );
      }
      
      console.log("Selected profile:", selectedProfile);
      
      const newRiskProfile = {
        profiles: riskProfiles as RiskProfile["profiles"],
        profile: selectedProfile as RiskProfile["profile"],
        templateId: data.templateId,
        riskScore: data.riskScore,
      };
      
      console.log("Setting risk profile:", newRiskProfile);
      setRiskProfile(newRiskProfile);
    } else {
      console.log("Clearing risk profile");
      setRiskProfile(null);
    }
  }, []);

  const updateAuthData = useCallback(async (
    authData: User | null,
    callback?: { onSuccess?: (profile: Profile | null) => void; onError?: (error: Error) => void }
  ) => {
    setUser(authData);
    if (authData?.signInUserSession) {
      const { accessToken, idToken } = authData.signInUserSession;
      const userGroups = accessToken.payload["cognito:groups"] || [];
      const roles = idToken.payload["x-role-ids"] || "";
      const userId = idToken.payload["x-user-id"];
      const combinedGroups = [...userGroups, ...roles.split(",")];
      setGroups(combinedGroups);
      setUser({ ...authData, userId: userId || "" });
      // TODO: Load profile data from API
      callback?.onSuccess?.(null);
    } else {
      setGroups([]);
      updateProfileData(null);
      setPortfolioSummaryTypes([]);
      setPortfolioSummary(null);
      setPortfolio([]);
      updateRiskProfileData(null);
      callback?.onSuccess?.(null);
    }
  }, [updateProfileData, updateRiskProfileData]);

  // Check for existing auth session on app mount
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user ID from token
        const idToken = session.tokens?.idToken;
        const userId = idToken?.payload?.["x-user-id"] as string;

        // Set user in context
        const userData = {
          userId: userId || currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId,
        };
        setUser(userData);
        
        console.log("Existing auth session found:", currentUser.username);
        
        // Load profile data if we have a userId
        if (userData.userId) {
          try {
            const { api } = await import("./services/api");
            const result = await api.get<Profile[]>(`/customer/v1/customers?query=userId==${userData.userId}`);
            if (result && result.length > 0) {
              // Update profile directly using setProfile and setTier
              const profileData = result[0];
              let newTier = 0;
              if (profileData) {
                if (profileData.investor && profileData.investorId) {
                  newTier = 3;
                } else if (validator.checkClientProfileComplete(profileData as Record<string, unknown>)) {
                  newTier = 2;
                } else {
                  newTier = 1;
                }
              }
              setTier(newTier);
              setProfile(profileData);
              
              // Load risk profile data using customerId (profile.id), not userId
              if (profileData.id) {
                try {
                  const riskResult = await api.get<Array<{ 
                    formTemplate?: { form?: { riskProfiles?: Array<{
                      id?: string;
                      name?: string;
                      description?: unknown;
                      investmentObjective?: unknown;
                      riskTolerance?: unknown;
                      riskRating?: string[];
                      scoreAssignment?: { min: number; max: number };
                    }> } }; 
                    riskScore?: number; 
                    templateId?: string 
                  }>>(
                    `/customer/v1/customers/${profileData.id}/risk-profiles?sortOrders=-createdDate`
                  );
                  if (riskResult && riskResult.length > 0) {
                    const riskData = riskResult[0];
                    const riskProfiles = riskData.formTemplate?.form?.riskProfiles || [];
                    let selectedProfile = null;
                    if (riskProfiles.length > 0 && riskData.riskScore !== undefined) {
                      selectedProfile = riskProfiles.find(
                        (profile) => {
                          if (!profile.scoreAssignment) return false;
                          const { min, max } = profile.scoreAssignment;
                          return riskData.riskScore! >= min && riskData.riskScore! <= max;
                        }
                      );
                    }
                    setRiskProfile({
                      profiles: riskProfiles as RiskProfile["profiles"],
                      profile: selectedProfile as RiskProfile["profile"],
                      templateId: riskData.templateId,
                      riskScore: riskData.riskScore,
                    });
                  }
                } catch (riskError) {
                  console.log("No risk profile found or error loading:", riskError);
                }
              }
            }
          } catch (profileError) {
            console.error("Error loading profile:", profileError);
          }
        }
      } catch (e) {
        // No authenticated user - this is normal for visitors
        console.log("No existing auth session");
      }
    };

    checkAuthSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EnvironmentContext.Provider value={{ devMode, setDevMode }}>
      <AuthContext.Provider value={{ updateAuthData, user, setUser, groups, setGroups }}>
        <ProfileContext.Provider value={{
          updateProfileData,
          updateRiskProfileData,
          profile,
          tier,
          portfolioSummaryTypes,
          portfolioSummary,
          portfolio,
          riskProfile,
        }}>
          <UIContext.Provider value={{ uiState, setUiState }}>
            <MobileWrapper>
              <Outlet />
            </MobileWrapper>
          </UIContext.Provider>
        </ProfileContext.Provider>
      </AuthContext.Provider>
    </EnvironmentContext.Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">{message}</h1>
      <p className="mb-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-gray-100 rounded">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
