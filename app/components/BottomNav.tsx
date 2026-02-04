import { NavLink, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { IoHome, IoHomeOutline, IoFolder, IoFolderOutline, IoReceipt, IoReceiptOutline, IoPerson, IoPersonOutline } from "react-icons/io5";
import { cn } from "../utils/cn";

interface NavItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: "/", labelKey: "main:tab.home", icon: <IoHomeOutline size={24} />, activeIcon: <IoHome size={24} /> },
    { path: "/portfolio", labelKey: "main:tab.portfolio", icon: <IoFolderOutline size={24} />, activeIcon: <IoFolder size={24} /> },
    { path: "/orders", labelKey: "main:tab.orders", icon: <IoReceiptOutline size={24} />, activeIcon: <IoReceipt size={24} /> },
    { path: "/profile", labelKey: "main:tab.profile", icon: <IoPersonOutline size={24} />, activeIcon: <IoPerson size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-sm border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 min-w-[64px]",
                "transition-colors",
                isActive ? "text-teal-700" : "text-gray-400"
              )}
            >
              {isActive ? item.activeIcon : item.icon}
              <span className="text-xs mt-1">{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
