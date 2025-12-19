"use client";

import React, { createContext, useContext, useState } from "react";

type WheelItem = { label: string; weight: number };

type LuckyWheelContextType = {
  items: WheelItem[];
  setItems: React.Dispatch<React.SetStateAction<WheelItem[]>>;
  addItem: (label: string) => void;
  removeItem: (index: number) => void;
  updateItemWeight: (index: number, weight: number) => void;
  colors: string[];
};

const LuckyWheelContext = createContext<LuckyWheelContextType | undefined>(undefined);

export const LuckyWheelProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WheelItem[]>([
    { label: "Nhất 🏆", weight: 1 },
    { label: "Nhì 🥈", weight: 0 },
    { label: "Ba 🥉", weight: 0 },
    { label: "Jackpot 💎", weight: 0 },
    { label: "Bonus 💰", weight: 0 },
    { label: "Chúc may mắn 🍀", weight: 0 },
    { label: "Thử lại 🔄", weight: 0 },
    { label: "Khuyến khích 🎖️", weight: 0 },
  ]);

  const colors = [
    "#4CAF50", "#2196F3", "#9C27B0", "#F44336",
    "#FF9800", "#FFC107", "#00BCD4", "#795548",
    "#F44336", "#3F51B5", "#009688", "#E91E63"
  ];

  const addItem = (label: string) => {
    if (label.trim() && items.length < 12) {
      setItems([...items, { label: label.trim(), weight: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 2) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItemWeight = (index: number, weight: number) => {
    if (weight < 0 || weight > 100) return;
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, weight } : item
    );
    setItems(updatedItems);
  };

  return (
    <LuckyWheelContext.Provider value={{ items, setItems, addItem, removeItem, updateItemWeight, colors }}>
      {children}
    </LuckyWheelContext.Provider>
  );
};

export const useLuckyWheel = () => {
  const ctx = useContext(LuckyWheelContext);
  if (!ctx) throw new Error("useLuckyWheel must be used within LuckyWheelProvider");
  return ctx;
};
