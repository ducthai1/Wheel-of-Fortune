"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, RotateCcw, Gift, Star, Heart, Zap, Crown, Diamond } from "lucide-react";
import ConfettiParty from "./ConfettiParty";
import { useLuckyWheel } from "./LuckyWheelContext";

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

export default function LuckyWheelDisplay() {
  const { items, colors } = useLuckyWheel();
  const [isTheBestRewards, setIsTheBestRewards] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const startRotRef = useRef(0);
  const targetRotRef = useRef(0);
  const durationMsRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const [winner, setWinner] = useState("");
  const [showWinner, setShowWinner] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const icons = [Gift, Star, Heart, Zap, Crown, Diamond, Gift, Star];

  const segmentAngle = items.length ? 360 / items.length : 360;

  const generateConicGradient = (colors: string[], itemCount: number) => {
    if (itemCount === 0) return "";
    const anglePerItem = 360 / itemCount;
    const segments = Array.from({ length: itemCount }, (_, i) => {
      const start = i * anglePerItem;
      const end = (i + 1) * anglePerItem;
      const color = colors[i % colors.length];
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${segments.join(", ")})`;
  };

  const weightedRandom = (options: { label: string; weight: number }[]) => {
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
    if (totalWeight === 0) return { index: 0, item: options[0] };
    const rand = Math.random() * totalWeight;
    let sum = 0;
    for (let i = 0; i < options.length; i++) {
      sum += options[i].weight;
      if (rand < sum) return { index: i, item: options[i] };
    }
    return { index: 0, item: options[0] };
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const stopRAF = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setShowWinner(false);
    setWinner("");
    setShowFireworks(false);
    setIsTheBestRewards(false);
    clearAllTimeouts();
    stopRAF();

    // chọn người thắng
    const { index: winnerIndex, item: winningItem } = weightedRandom(items);
    const segmentAngleLocal = 360 / items.length;
    const segmentCenter = winnerIndex * segmentAngleLocal + segmentAngleLocal / 2;

    const margin = 6;
    const reachable = Math.max(0, segmentAngleLocal - 2 * margin);
    const randomWithin = reachable > 0 ? (Math.random() * reachable - reachable / 2) : 0;
    const targetAngle = segmentCenter + randomWithin;

    const currentRotationNormalized = ((rotationRef.current % 360) + 360) % 360;
    const desiredMod = ((360 - targetAngle) % 360 + 360) % 360;
    const spins = Math.floor(Math.random() * (16 - 7 + 1)) + 12;
    const remainder = ((desiredMod - currentRotationNormalized + 360) % 360);
    const totalDelta = spins * 360 + remainder;

    const durationMs = Math.round(Math.max(4.0, 3.2 + spins * 0.55) * 1000);
    startTimeRef.current = performance.now();
    startRotRef.current = rotationRef.current;
    targetRotRef.current = startRotRef.current + totalDelta;
    durationMsRef.current = durationMs;

    const target = targetRotRef.current;
    const increasing = target >= startRotRef.current;

    const loop = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const tRaw = Math.min(1, elapsed / durationMsRef.current);
      const eased = easeOutQuint(tRaw);
      let cur = startRotRef.current + eased * totalDelta;

      // CLAMP: đảm bảo cur không vượt target (tránh overshoot)
      if (increasing) cur = Math.min(cur, target);
      else cur = Math.max(cur, target);

      rotationRef.current = cur;
      setRotation(cur);

      if (tRaw < 1) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Kết thúc: stop RAF, đảm bảo state final = chính xác target (không round)
        stopRAF();
        rotationRef.current = target;
        setRotation(target);

        // Đợi browser paint final frame trước khi show modal để tránh nhảy
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setWinner(winningItem.label);
            setShowWinner(true);

            // mount confetti sau 1 rAF nữa để tránh blocking paint modal
            if (winningItem.label === items[0]?.label || winningItem.label === items[1]?.label) {
              requestAnimationFrame(() => {
                setShowFireworks(true);
                setIsTheBestRewards(true);
              });
            }
            setIsSpinning(false);
          });
        });
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  };


  const resetWheel = () => {
    stopRAF();
    clearAllTimeouts();
    rotationRef.current = 0;
    setRotation(0);
    setWinner("");
    setShowWinner(false);
    setIsSpinning(false);
    setShowFireworks(false);
    setIsTheBestRewards(false);
  };

  const closeWinnerModal = useCallback(() => {
    setShowWinner(false);
    setShowFireworks(false);
    setWinner("");
  }, []);

  useEffect(() => {
    if (!showWinner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWinnerModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showWinner, closeWinnerModal]);

  return (
    <div>
      <div className="select-none min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-300 px-4 py-8 overflow-hidden relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23FFA726%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8 md:h-[64px]">
            <motion.h1
              className="relative inline-block text-4xl md:text-5xl font-extrabold tracking-wide 
                        bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 
                        bg-clip-text text-transparent drop-shadow-[0_4px_6px_rgba(255,140,0,0.6)] 
                        animate-gradient-x h-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Vòng Quay May Mắn
            </motion.h1>
          </div>

          <div className="grid lg:grid-cols-1 gap-8 items-start">
            <div className="flex flex-col items-center space-y-6 gap-6">
              <div className="relative">
                <div
                  className="absolute left-1/2 z-40"
                  style={{ transform: "translateX(-50%) rotate(180deg) translateY(-50%)", top: 7, overflow: "hidden", height: '19px' }}
                  aria-hidden
                >
                  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <filter id="f" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25"/>
                      </filter>
                    </defs>
                    <path d="M20 0 L36 20 H24 V28 H16 V20 H4 L20 0 Z" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#f)"/>
                  </svg>
                </div>

                <div className="w-[80vw] max-w-[520px] h-[80vw] max-h-[520px] rounded-full bg-white p-4 shadow-2xl mx-auto">
                  <div className="w-full h-full rounded-full bg-yellow-100 p-2 relative overflow-visible">
                    <div
                      ref={wheelRef}
                      className="w-full h-full rounded-full relative overflow-hidden"
                      style={{
                        background: generateConicGradient(colors, items.length),
                        transform: `rotate(${rotation}deg) translateZ(0)`,
                        willChange: "transform",
                      }}
                    >
                      {items.map((item, index) => {
                        // --- Color helpers ---

                        const hexToRgb = (hex:string): [number, number, number] => {
                          let h = hex.replace('#','').trim();
                          if (h.length === 3) h = h.split('').map(c => c + c).join('');
                          const num = parseInt(h, 16);
                          return [ (num>>16)&255, (num>>8)&255, num&255 ];
                        };

                        const rgba = (hex:string, alpha:number) => {
                          const [r,g,b] = hexToRgb(hex);
                          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };

                        // Từ màu gốc: nếu màu tối -> làm sáng nhiều; nếu màu sáng -> làm tối vừa phải
                        const deriveIconColors = () => {
                          const iconBgColor     = 'rgba(31, 36, 45, 0.18)';  // nền tối, hơi trong suốt
                          const iconBorderColor = 'rgba(10, 12, 17, 0.05)';  // viền đậm
                          return { iconBgColor, iconBorderColor };
                        };

                        const angle = index * segmentAngle + segmentAngle / 2;
                        const IconComponent = icons[index % icons.length];
                        // Lấy màu gốc
                        const colorString = colors[index % colors.length];
                        const baseColor = colorString
                          .split(' ')[0]
                          .replace('linear-gradient(135deg,', '')
                          .replace(',', '')
                          .trim();

                        const rgbColor = baseColor.includes('#') ? baseColor : '#667eea';

                        // Tự tăng/giảm sáng để nền nổi bật hơn
                        const { iconBgColor, iconBorderColor } = deriveIconColors();

                        return (
                          <div
                            key={`label-${index}`}
                            className="absolute text-white font-bold text-sm flex flex-col items-center justify-center"
                            style={{
                              left: `${50 + 35 * Math.cos(((angle - 90) * Math.PI) / 180)}%`,
                              top:  `${50 + 35 * Math.sin(((angle - 90) * Math.PI) / 180)}%`,
                              transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                              width: "70px",
                              textAlign: "center",
                              gap: '15px'
                            }}
                          >
                            <div
                              className={`relative ${!isSpinning ? 'skeleton-loading' : ''}`}
                              style={{
                                borderRadius: '60% 40% 15% 85% / 55% 85% 15% 45%',
                                width: '83%',
                                height: '59px',
                                transform: 'rotate(45deg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                // Nền & viền dùng màu đã được “nâng/giảm” sáng để nổi khối
                                background: `linear-gradient(135deg, ${iconBgColor}, ${iconBorderColor})`,
                                border: `2px solid ${iconBorderColor}`,
                                boxShadow: `0 4px 12px ${rgba(rgbColor, 0.28)}, inset 0 1px 3px rgba(255, 255, 255, 0.56)`
                              }}
                            >
                              <IconComponent size={16} className="mb-1" style={{transform: 'rotate(-45deg)'}} />
                            </div>
                            <span className="leading-tight text-xs break-words w-[96px]">{item.label}</span>
                          </div>
                        );
                      })}

                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                        {!isSpinning && (
                          <Button
                            onClick={spinWheel}
                            disabled={isSpinning || items.length === 0}
                            className="w-full h-full bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent flex items-center justify-center cursor-pointer"
                          >
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={spinWheel}
                  disabled={isSpinning || items.length === 0}
                  className="cursor-pointer border-2 border-orange-400 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  <Play className="mr-2" size={24} />
                  {isSpinning ? "Đang quay..." : "QUAY NGAY! 🎊"}
                </Button>

                <Button
                  onClick={resetWheel}
                  variant="outline"
                  className="border-2 border-orange-400 text-orange-600 hover:bg-orange-400 hover:text-white hover:border-white px-6 py-4 rounded-full font-semibold bg-white shadow-lg cursor-pointer"
                >
                  <RotateCcw className="mr-2" size={20} />
                  Reset
                </Button>
              </div>

              <AnimatePresence>
                {showWinner && (
                  <motion.div
                    key="winner-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={closeWinnerModal}
                    aria-modal="true"
                    role="dialog"
                  >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" />
                    <motion.div
                      key="winner-modal"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      className="relative z-10 w-full max-w-lg mx-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-red-300 shadow-2xl cursor-default">
                        <CardContent className="p-6 md:p-8 relative">
                          <h3 className="text-3xl md:text-4xl font-bold text-red-600 mb-3 text-center">
                            {isTheBestRewards ? "🎉 CHÚC MỪNG! 🎉" : "🎯 KẾT QUẢ 🎯"}
                          </h3>

                          <p className="text-2xl md:text-3xl text-orange-600 font-bold mb-2 text-center">
                            {winner}
                          </p>

                          <p className="text-red-500 text-base md:text-lg font-semibold text-center">
                            🎡 Bạn đã quay được - {winner} – Tiếp tục thử vận may thôi nào! 🎡
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/** ConfettiParty mount controlled by showFireworks */}
        <ConfettiParty show={showFireworks} />
      </div>
    </div>
  );
}
