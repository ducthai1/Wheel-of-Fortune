import { LuckyWheelProvider } from "@/components/ui/LuckyWheelContext";
import LuckyWheelManager from "@/components/ui/manage-wheel";

export default function ManagePage() {
  return (
    <LuckyWheelProvider>
      <LuckyWheelManager />
    </LuckyWheelProvider>
  );
}