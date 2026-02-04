import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { IoArrowBack, IoLogOutOutline } from "react-icons/io5";
import { cn } from "../utils/cn";
import type { ReactNode } from "react";
import appLogo from "../assets/images/app_logo.png";

interface TopNavProps {
  allowBack?: boolean;
  showLogo?: boolean;
  showLogout?: boolean;
  inverse?: boolean;
  title?: string;
  rightContent?: ReactNode;
  onBack?: () => void;
  onLogout?: () => void;
}

export function TopNav({ 
  allowBack, 
  showLogo, 
  showLogout, 
  inverse, 
  title,
  rightContent,
  onBack,
  onLogout 
}: TopNavProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const textColor = inverse ? "text-white" : "text-gray-900";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <nav className={cn("flex items-center justify-between py-4", textColor)}>
      <div className="flex items-center gap-4">
        {allowBack && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Go back"
          >
            <IoArrowBack size={24} />
          </button>
        )}
        {showLogo && (
          <img 
            src={appLogo} 
            alt="FAM Invest" 
            className="h-8 w-auto"
          />
        )}
        {title && (
          <span className="font-medium">{title}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
        {showLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 p-2 hover:bg-black/10 rounded transition-colors text-sm"
          >
            <IoLogOutOutline size={20} />
            <span className="hidden sm:inline">{t("common:button.logout")}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
