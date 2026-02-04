import { createContext } from "react";

export interface User {
  userId: string;
  username?: string;
  email?: string;
  attributes?: {
    email?: string;
  };
  signInUserSession?: {
    accessToken: {
      payload: {
        "cognito:groups"?: string[];
      };
    };
    idToken: {
      payload: {
        "x-role-ids"?: string;
        "x-user-id"?: string;
      };
      getJwtToken: () => string;
    };
  };
}

export interface Profile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  nric?: string;
  dateOfBirth?: Date | string;
  countryOfBirth?: string;
  nationality?: string;
  investor?: boolean;
  investorId?: string;
  [key: string]: unknown;
}

export interface PortfolioSummary {
  totalAssetValue?: number;
  totalDeposit?: number;
  totalWithdrawal?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export interface PortfolioItem {
  productId: string;
  productName: string;
  fundId: string;
  fundName: string;
  units: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalNavSGD?: number;
  totalNavUSD?: number;
  depositAmountSGD?: number;
  depositAmountUSD?: number;
  withdrawAmountSGD?: number;
  withdrawAmountUSD?: number;
  classDetails?: Array<{ noOfShares: number }>;
}

export interface RiskProfileItem {
  id: string;
  name: string;
  description: string | unknown;
  scoreAssignment?: { min: number; max: number };
  riskRating?: string[];
  investmentObjective?: string | unknown;
  riskTolerance?: string | unknown;
  assetAllocation?: { equities: number; bonds: number };
  suitability?: number[];
}

export interface RiskProfile {
  profiles: RiskProfileItem[];
  profile?: RiskProfileItem;
  templateId?: string;
  riskScore?: number;
  riskAnswer?: Record<string, string>;
}

export interface AuthContextType {
  updateAuthData: (authData: User | null, callback?: {
    onSuccess?: (profile: Profile | null) => void;
    onError?: (error: Error) => void;
  }) => Promise<void>;
  user: User | null;
  setUser: (user: User | null) => void;
  groups: string[];
  setGroups: (groups: string[]) => void;
}

export interface ProfileContextType {
  updateProfileData: (profileData: Profile | null) => Promise<void>;
  updateRiskProfileData: (riskProfileData: unknown) => Promise<void>;
  profile: Profile | null;
  tier: number;
  portfolioSummaryTypes: unknown[];
  portfolioSummary: PortfolioSummary | null;
  portfolio: PortfolioItem[];
  riskProfile: RiskProfile | null;
}

export interface UIContextType {
  uiState: Record<string, unknown>;
  setUiState: (state: Record<string, unknown>) => void;
}

export interface EnvironmentContextType {
  devMode: boolean;
  setDevMode: (devMode: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  updateAuthData: async () => {},
  user: null,
  setUser: () => {},
  groups: [],
  setGroups: () => {},
});

export const ProfileContext = createContext<ProfileContextType>({
  updateProfileData: async () => {},
  updateRiskProfileData: async () => {},
  profile: null,
  tier: 0,
  portfolioSummaryTypes: [],
  portfolioSummary: null,
  portfolio: [],
  riskProfile: null,
});

export const UIContext = createContext<UIContextType>({
  uiState: {},
  setUiState: () => {},
});

export const EnvironmentContext = createContext<EnvironmentContextType>({
  devMode: false,
  setDevMode: () => {},
});
