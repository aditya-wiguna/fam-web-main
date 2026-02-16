import { Outlet } from "react-router";
import { BottomNav } from "../components";

export default function MainLayout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a1847" }}>
      <Outlet />
      <BottomNav />
    </div>
  );
}
