import LuckyWheelDisplay from "@/components/ui/futuristic-wheel";
import { LuckyWheelProvider } from "@/components/ui/LuckyWheelContext";

export default function WheelPage() {
  return (
    <LuckyWheelProvider>
      <LuckyWheelDisplay />
    </LuckyWheelProvider>
  );
}
