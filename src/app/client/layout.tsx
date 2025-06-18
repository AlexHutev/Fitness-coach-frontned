import type { Metadata } from "next";
import { ClientAuthProvider } from "@/context/ClientAuthContext";

export const metadata: Metadata = {
  title: "FitnessCoach - Client Portal",
  description: "Access your personal training program and track your progress.",
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientAuthProvider>
      {children}
    </ClientAuthProvider>
  );
}