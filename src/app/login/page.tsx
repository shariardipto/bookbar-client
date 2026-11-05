import type { Metadata } from "next";
import { MembershipPreview } from "@/components/auth/membership-preview";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return <MembershipPreview mode="login" />;
}
