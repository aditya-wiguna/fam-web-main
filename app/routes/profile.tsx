import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { H1, P, Button, Card, TopNav, Small } from "../components";
import { HighlightHeader, HighlightBody } from "../components/Highlight";
import { AuthContext, ProfileContext } from "../contexts";
import { ProfileDataField } from "../utils/ProfileDataField";
import { useAuth } from "../services";
import {
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoKeyOutline,
  IoHeadsetOutline,
  IoReaderOutline,
  IoLockClosedOutline,
  IoChevronForward,
  IoLogOutOutline,
} from "react-icons/io5";

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { profile, riskProfile } = useContext(ProfileContext);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <HighlightHeader>
          <TopNav inverse showLogo />
          <H1 color="white" className="text-3xl mb-2">{t("profile:heading.title")}</H1>
        </HighlightHeader>
        <HighlightBody className="min-h-[60vh]">
          <div className="text-center py-12">
            <P color="grey500" className="my-4">Please login to view your profile</P>
            <Button onClick={() => navigate("/login")}>{t("login:button.login")}</Button>
          </div>
        </HighlightBody>
      </div>
    );
  }

  // Build name from profile
  let name = "";
  let email = "";
  let mobile = "";

  if (profile?.[ProfileDataField.NAME_FIRST]) {
    name += `${profile[ProfileDataField.NAME_FIRST]} `;
  }
  if (profile?.[ProfileDataField.NAME_LAST]) {
    name += `${profile[ProfileDataField.NAME_LAST]}`;
  }
  if (profile?.[ProfileDataField.CONTACT_EMAIL]) {
    email = profile[ProfileDataField.CONTACT_EMAIL] as string;
  }
  if (profile?.[ProfileDataField.CONTACT_MOBILE]) {
    mobile = profile[ProfileDataField.CONTACT_MOBILE] as string;
  }

  const menus = [
    {
      name: "personalDetails",
      route: "/personal-details",
      label: t("profile:menu.personalDetails"),
      icon: IoPersonOutline,
    },
    {
      name: "declarations",
      route: "/declarations",
      label: t("profile:menu.declarations"),
      icon: IoShieldCheckmarkOutline,
    },
    {
      name: "riskPreference",
      route: riskProfile ? "/risk-profile" : "/risk-assessment",
      label: t("profile:menu.riskPreference"),
      icon: IoSpeedometerOutline,
    },
    {
      name: "changePassword",
      route: "/change-password",
      label: t("profile:menu.changePassword"),
      icon: IoKeyOutline,
    },
    {
      name: "contactSupport",
      route: "/contact",
      label: t("profile:menu.contactSupport"),
      icon: IoHeadsetOutline,
    },
    {
      name: "termsConditions",
      route: "/terms",
      label: t("profile:menu.termsConditions"),
      icon: IoReaderOutline,
    },
    {
      name: "privacyPolicy",
      route: "/privacy",
      label: t("profile:menu.privacyPolicy"),
      icon: IoLockClosedOutline,
    },
  ];

  return (
    <div className="min-h-screen">
      <HighlightHeader>
        <TopNav inverse showLogo showLogout onLogout={handleLogout} />
        <div className="mb-4">
          <H1 color="white" className="text-3xl mb-2">
            {name.trim() || t("profile:heading.title")}
          </H1>
          {email && (
            <div className="mt-2">
              <Small color="white">{t("profile:label.email")}: {email}</Small>
            </div>
          )}
          {mobile && (
            <Small color="white">{t("profile:label.mobile")}: {mobile}</Small>
          )}
          
          {/* Risk Profile Progress */}
          {riskProfile?.profile && (
            <Card className="mt-4 bg-white/10 border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <Small className="text-[#0a1847]">Your Risk Profile</Small>
                  <P className="font-semibold text-[#0a1847]">{riskProfile.profile.name}</P>
                </div>
                <button
                  onClick={() => navigate("/risk-profile")}
                  className="text-[#0a1847] text-sm"
                >
                  View →
                </button>
              </div>
            </Card>
          )}
          
          {!riskProfile && (
            <Card className="mt-4 bg-white/10 border-white/20">
              <P color="white" className="mb-2">Complete your risk assessment</P>
              <Button
                compact
                darkBackground
                onClick={() => navigate("/risk-assessment")}
              >
                Start Assessment
              </Button>
            </Card>
          )}
        </div>
      </HighlightHeader>

      <HighlightBody color="whiteRGBA" className="min-h-[50vh] pb-24">
        <div className="space-y-1">
          {menus.map((menu) => (
            <button
              key={menu.name}
              onClick={() => navigate(menu.route)}
              className="w-full flex items-center justify-between py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <menu.icon size={24} className="text-gray-700" />
                <span className="text-gray-900">{menu.label}</span>
              </div>
              <IoChevronForward className="text-gray-400" />
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-4 text-red-600 hover:bg-red-50 transition-colors"
          >
            <IoLogOutOutline size={24} />
            <span>{t("profile:menu.logout")}</span>
          </button>
        </div>
      </HighlightBody>
    </div>
  );
}
