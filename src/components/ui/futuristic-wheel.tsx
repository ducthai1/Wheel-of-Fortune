"use client"

import React, { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Play, RotateCcw, Gift, Star, Heart, Zap, Crown, Diamond } from "lucide-react"
import ConfettiParty from "./ConfettiParty"

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export default function LuckyWheel() {
  const [items, setItems] = useState(
    [
      { label: "Giải nhất 🏆", weight: 5 },
      { label: "Giải nhì 🥈", weight: 0 },
      { label: "Giải ba 🥉", weight: 0 },
      { label: "Jackpot 💎", weight: 0 },
      { label: "Bonus 💰", weight: 0 },
      { label: "Chúc may mắn 🍀", weight: 0},
      { label: "Thử lại 🔄", weight: 5 },
      { label: "Giải khuyến khích 🎖️", weight: 0 },
    ]
  )
  const [newItem, setNewItem] = useState("")
  const [isTheBestRewards, setIsTheBestRewards] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const startRotRef = useRef(0)
  const targetRotRef = useRef(0)
  const durationMsRef = useRef(0)
  const timeoutsRef = useRef<number[]>([])

  const [spinDurationInfo, setSpinDurationInfo] = useState(0)
  const [winner, setWinner] = useState("")
  const [showWinner, setShowWinner] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)

  const colors = [
    "#4CAF50",
    "#2196F3",
    "#9C27B0",
    "#F44336",
    "#FF9800",
    "#FFC107",
    "#00BCD4",
    "#795548",
  ]
  const icons = [Gift, Star, Heart, Zap, Crown, Diamond, Gift, Star]

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      timeoutsRef.current.forEach((t) => clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [])

  const addItem = () => {
    if (newItem.trim() && items.length < 12) {
      setItems([...items, { label: newItem.trim(), weight: 1 }])
      setNewItem("")
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 2) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const segmentAngle = 360 / items.length

  const generateConicGradient = (colors: string[], itemCount: number) => {
    const anglePerItem = 360 / itemCount
    const segments = Array.from({ length: itemCount }, (_, i) => {
      const start = i * anglePerItem
      const end = (i + 1) * anglePerItem
      const color = colors[i % colors.length]
      return `${color} ${start}deg ${end}deg`
    })

    return `conic-gradient(${segments.join(', ')})`
  }

  const weightedRandom = (options: { label: string; weight: number }[]) => {
    const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)
    if (totalWeight === 0) {
      return { index: 0, item: options[0] }
    }
    const rand = Math.random() * totalWeight
    let sum = 0
    for (let i = 0; i < options.length; i++) {
      sum += options[i].weight
      if (rand < sum) {
        return { index: i, item: options[i] }
      }
    }
    return { index: 0, item: options[0] }
  }

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id))
    timeoutsRef.current = []
  }

  const stopRAF = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return

    setIsSpinning(true)
    setShowWinner(false)
    setWinner("")
    setShowFireworks(false)
    setIsTheBestRewards(false)
    clearAllTimeouts()
    stopRAF()

    const { index: winnerIndex, item: winningItem } = weightedRandom(items)
    const segmentAngleLocal = 360 / items.length
    const segmentCenter = winnerIndex * segmentAngleLocal + segmentAngleLocal / 2

    const margin = 6
    const reachable = Math.max(0, segmentAngleLocal - 2 * margin)
    const randomWithin = reachable > 0 ? (Math.random() * reachable - reachable / 2) : 0
    const targetAngle = segmentCenter + randomWithin

    const currentRotationNormalized = ((rotationRef.current % 360) + 360) % 360
    const desiredMod = ((360 - targetAngle) % 360 + 360) % 360

    const minSpins = 7
    const maxSpins = 13
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins

    const remainder = ((desiredMod - currentRotationNormalized + 360) % 360)
    const totalDelta = spins * 360 + remainder

    const durationSeconds = Math.max(4.0, 2.8 + spins * 0.45)
    const durationMs = Math.round(durationSeconds * 1000)

    setSpinDurationInfo(durationSeconds)
    startTimeRef.current = performance.now()
    startRotRef.current = rotationRef.current
    targetRotRef.current = startRotRef.current + totalDelta
    durationMsRef.current = durationMs

    const loop = (now: number) => {
      const elapsed = now - startTimeRef.current
      const tRaw = Math.min(1, elapsed / durationMsRef.current)
      const eased = easeOutQuint(tRaw)
      const cur = startRotRef.current + eased * totalDelta
      rotationRef.current = cur
      setRotation(cur)

      if (tRaw < 1) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        rotationRef.current = targetRotRef.current
        setRotation(targetRotRef.current)
        const showId = window.setTimeout(() => {
          setWinner(winningItem.label)
          console.log(winningItem.label)
          setShowWinner(true)
          if(winningItem.label === items[0].label || winningItem.label === items[1].label) {
            setShowFireworks(true)
            setIsTheBestRewards(true)
          }
          setIsSpinning(false)
          const offId = window.setTimeout(() => {
            setShowFireworks(false)
            setIsTheBestRewards(true)
          }
          , 3800)
          timeoutsRef.current.push(offId)
        }, 120)
        timeoutsRef.current.push(showId)
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  const resetWheel = () => {
    stopRAF()
    clearAllTimeouts()
    rotationRef.current = 0
    setRotation(0)
    setWinner("")
    setShowWinner(false)
    setIsSpinning(false)
    setShowFireworks(false)
    setIsTheBestRewards(false)
    setSpinDurationInfo(0)
  }

  return (
    <div className="select-none min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-300 p-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23FFA726%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8 h-[64px]">
          <motion.h1
            className="relative inline-block text-5xl font-extrabold tracking-wide 
                      bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 
                      bg-clip-text text-transparent drop-shadow-[0_4px_6px_rgba(255,140,0,0.6)] 
                      animate-gradient-x h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Vòng Quay May Mắn
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 
                            bg-gradient-to-r from-transparent via-yellow-300 to-transparent 
                            blur-lg opacity-70"></span>
          </motion.h1>
        </div>


        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: larger wheel */}
          <div className="flex flex-col items-center space-y-6">
            {/* parent relative để đặt mũi tên absolute căn giữa */}
            <div className="relative">
              {/* Pointer (ở trên, hướng xuống) */}
              <div
                className="absolute left-1/2 z-40"
                style={{ transform: "translateX(-50%) rotate(180deg) translateY(-50%)", top: 7, overflow: "hidden", height: '19px' }}
                aria-hidden
              >
                {/* SVG mũi tên lớn hướng xuống, có viền trắng và shadow */}
                <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="f" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25"/>
                    </filter>
                  </defs>
                  <path d="M20 0 L36 20 H24 V28 H16 V20 H4 L20 0 Z" fill="#E53E3E" stroke="#FFFFFF" strokeWidth="1.5" filter="url(#f)"/>
                </svg>
              </div>

              {/* Wheel container - responsive larger size */}
              <div className="w-[80vw] max-w-[520px] h-[80vw] max-h-[520px] rounded-full bg-white p-4 shadow-2xl mx-auto">
                <div className="w-full h-full rounded-full bg-yellow-100 p-2 relative overflow-visible">
                  {/* rotating wheel (updated by RAF) */}
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden"
                    style={{
                      background: generateConicGradient(colors, items.length),
                      transform: `rotate(${rotation}deg)`,
                      willChange: "transform",
                    }}
                  >
                    {items.map((item, index) => {
                      const angle = index * segmentAngle + segmentAngle / 2
                      const IconComponent = icons[index % icons.length]

                      return (
                        <div
                          key={`label-${index}`}
                          className="absolute text-white font-bold text-sm flex flex-col items-center justify-center"
                          style={{
                            left: `${50 + 35 * Math.cos(((angle - 90) * Math.PI) / 180)}%`,
                            top: `${50 + 35 * Math.sin(((angle - 90) * Math.PI) / 180)}%`,
                            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                            width: "70px",
                            textAlign: "center",
                          }}
                        >
                          <IconComponent size={16} className="mb-1" />
                          <span className="leading-tight text-xs break-words">{item.label}</span>
                        </div>
                      )
                    })}

                    {/* center button */}
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

            {/* controls */}
            <div className="flex space-x-4">
              <Button
                onClick={spinWheel}
                disabled={isSpinning || items.length === 0}
                className="cursor-pointer bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                <Play className="mr-2" size={24} />
                {isSpinning ? "Đang quay..." : "QUAY NGAY! 🎊"}
              </Button>

              <Button
                onClick={resetWheel}
                variant="outline"
                className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 px-6 py-4 rounded-full font-semibold bg-white shadow-lg"
              >
                <RotateCcw className="mr-2" size={20} />
                Reset
              </Button>
            </div>

            <AnimatePresence>
              {showWinner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  className="text-center"
                >
                  <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-red-300 shadow-2xl">
                    <CardContent className="p-8">
                      <h3 className="text-4xl font-bold text-red-600 mb-4">🎉 CHÚC MỪNG! 🎉</h3>
                      <p className="text-3xl text-orange-600 font-bold mb-2">{winner}</p>
                      <p className="text-red-500 text-lg font-semibold">🧧 Phúc Lộc Thọ - Vạn Sự Như Ý! 🧧</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: controls/cards (giữ nguyên) */}
          <div className="space-y-6">
            <Card className="bg-white/90 border-2 border-orange-200 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-orange-700 mb-4 flex items-center">
                  <Gift className="mr-2" />
                  Quản lý các mục
                </h3>

                <div className="flex space-x-2 mb-4">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Nhập mục mới..."
                    className="bg-orange-50 border-2 border-orange-200 text-orange-800 placeholder-orange-400"
                    onKeyPress={(e) => e.key === "Enter" && addItem()}
                  />
                  <Button
                    onClick={addItem}
                    disabled={!newItem.trim() || items.length >= 12}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus size={20} />
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg shadow-md"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      <span className="text-white font-semibold">{item.label}</span>
                      <Button
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 2}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>

                <p className="text-orange-600 text-sm mt-4 font-medium">
                  Tổng cộng: {items.length} mục (tối đa 12 mục)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-700 mb-3 flex items-center">
                  <Star className="mr-2" />
                  Hướng dẫn sử dụng
                </h3>
                <ul className="text-blue-600 space-y-2 font-medium">
                  <li>🎯 Thêm các mục bạn muốn vào danh sách</li>
                  <li>🎊 Nhấn "QUAY NGAY!" để bắt đầu quay</li>
                  <li>🎉 Vòng quay sẽ dừng và hiển thị kết quả</li>
                  <li>🔄 Sử dụng "Reset" để đặt lại vòng quay</li>
                  <li>📝 Tối thiểu 2 mục, tối đa 12 mục</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfettiParty show={showFireworks} />
    </div>
  )
}
