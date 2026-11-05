import type { Metadata } from "next";
import { MembershipPreview } from "@/components/auth/membership-preview";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return <MembershipPreview mode="register" />;
}
