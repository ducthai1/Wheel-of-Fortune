"use client";

import { LuckyWheelProvider } from "@/components/ui/LuckyWheelContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <LuckyWheelProvider>{children}</LuckyWheelProvider>;
}

