"use client"

import { motion } from "framer-motion"

interface ConfettiProps {
  show: boolean
}

export function Confetti({ show }: ConfettiProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Pháo bông màu sắc */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 1, y: 0 }}
          animate={{
            scale: [0, 1, 0.5, 0],
            opacity: [1, 1, 0.5, 0],
            y: [0, -100, -200, -300],
            x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
            rotate: [0, 360, 720],
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 1,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Emoji pháo hoa */}
      {["🎊", "🎉", "✨", "🌟", "💫", "🎆", "🎇", "🧧", "🌸"].map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className="absolute text-4xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, rotate: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360],
            opacity: [1, 1, 1, 0],
            y: [0, -50, -100],
          }}
          transition={{
            duration: 2.5,
            delay: Math.random() * 1.5,
            ease: "easeOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}
