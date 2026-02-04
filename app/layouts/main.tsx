import { Outlet } from "react-router";
import { BottomNav } from "../components";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
