import { useContext } from "react";
import type { Route } from "./+types/home";
import { AuthContext } from "../contexts";
import { VisitorHome } from "../screens/home/VisitorHome";
import { UserHome } from "../screens/home/UserHome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FAM Invest" },
    { name: "description", content: "Invest with FAM - Your trusted investment partner" },
  ];
}

export default function Home() {
  const { user } = useContext(AuthContext);

  return user ? <UserHome /> : <VisitorHome />;
}
