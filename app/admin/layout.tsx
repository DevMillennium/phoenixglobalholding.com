import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050608] text-[#e8e9ed] antialiased">{children}</div>
  );
}
