import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser, fetchAuthSession } from "@aws-amplify/auth";
import { AuthContext, ProfileContext, type Profile } from "../contexts";
import { useProfileService } from "../services/useProfileService";
import { useRiskProfileService } from "../services/useRiskProfileService";
import { P } from "../components";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { updateAuthData } = useContext(AuthContext);
  const { updateProfileData, updateRiskProfileData } = useContext(ProfileContext);
  const { get: getProfile } = useProfileService();
  const { get: getRiskProfile } = useRiskProfileService();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user ID from token
        const idToken = session.tokens?.idToken;
        const userId = idToken?.payload?.["x-user-id"] as string;

        if (userId) {
          // Load user profile
          const profile = await getProfile(userId);
          
          if (profile?.id) {
            // Load risk profile
            const riskProfile = await getRiskProfile(profile.id).catch(() => null);

            await updateProfileData(profile as Profile);
            await updateRiskProfileData(riskProfile);
          }
        }

        await updateAuthData({
          userId: currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId,
        });

        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, updateAuthData, updateProfileData, updateRiskProfileData, getProfile, getRiskProfile]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
        <P color="grey700">Completing sign in...</P>
      </div>
    </div>
  );
}
