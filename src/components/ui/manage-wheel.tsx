"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Plus, Trash2, Star } from "lucide-react";
import { useLuckyWheel } from "./LuckyWheelContext";
import { motion } from "framer-motion"

export default function LuckyWheelManager() {
	const { items, addItem, removeItem, updateItemWeight, colors } = useLuckyWheel();
  const [newItem, setNewItem] = useState("");
	return (
		<div className="select-none min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-300 p-4 overflow-hidden relative">
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
						<span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 
														bg-gradient-to-r from-transparent via-yellow-300 to-transparent 
														blur-lg opacity-70"></span>
					</motion.h1>
				</div>


				<div className="grid lg:grid-cols-1 gap-8 items-start">
					{/* RIGHT: controls/cards (giữ nguyên) */}
					<div className="space-y-6">
						<Card className="bg-white/90 border-2 border-orange-200 shadow-xl">
							<CardContent className="py-4 px-2">
								<h3 className="text-2xl font-bold text-orange-700 mb-4 flex items-center px-4">
									<Gift className="mr-2" />
									Quản lý các mục
								</h3>

								<div className="flex space-x-2 mb-4 px-4">
									<Input
										value={newItem}
										onChange={(e) => setNewItem(e.target.value)}
										placeholder="Nhập mục mới..."
										className="bg-orange-50 border-2 border-orange-200 text-orange-800 placeholder-orange-400"
										onKeyDown={(e) => {
											if (e.key === "Enter" && newItem.trim()) {
												addItem(newItem);
												setNewItem("");
											}
										}}
									/>
									<Button
										onClick={() => {
											addItem(newItem);
											setNewItem("");
										}}
										disabled={!newItem.trim() || items.length >= 12}
										className="bg-green-500 hover:bg-green-600 text-white"
									>
										<Plus size={20} />
									</Button>
								</div>

								<div className="space-y-2 max-h-64 overflow-y-auto px-4">
									{items.map((item, index) => (
											<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '10px', alignItems: 'center'}} className="mb-2" key={index}>
												<div
													className="flex items-center justify-between p-3 rounded-lg shadow-md flex-1"
													style={{ backgroundColor: colors[index % colors.length] }}
												>
													<span className="text-white font-semibold">{item.label}</span>
													<Button
														onClick={() => removeItem(index)}
														disabled={items.length <= 2}
														variant="ghost"
														size="sm"
														className="text-white hover:bg-white/20 cursor-pointer"
													>
														<Trash2 size={16} />
													</Button>
												</div>
												<div className="flex flex-col items-center gap-1">
													<label className="text-xs text-orange-700 font-medium">Tỉ lệ</label>
													<input
														type="number"
														min="0"
														max="100"
														value={item.weight}
														className="w-20 h-10 border-2 border-orange-300 rounded px-2 py-1 text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-white text-orange-800 font-semibold"
														onKeyDown={(e) => {
															const invalidChars = ["-", "+", "e", ".", "E"];
															if (invalidChars.includes(e.key)) {
																e.preventDefault();
															}
														}}
														onChange={(e) => {
															const inputValue = e.target.value;
															// Cho phép xóa để nhập lại
															if (inputValue === '') {
																updateItemWeight(index, 0);
																return;
															}
															
															const numValue = parseInt(inputValue, 10);
															// Nếu parse thành công và trong khoảng hợp lệ
															if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
																updateItemWeight(index, numValue);
															}
															// Nếu nhập số > 100, giới hạn ở 100
															else if (!isNaN(numValue) && numValue > 100) {
																updateItemWeight(index, 100);
															}
														}}
														onBlur={(e) => {
															// Khi mất focus, đảm bảo giá trị hợp lệ
															const numValue = parseInt(e.target.value, 10);
															if (isNaN(numValue) || numValue < 0) {
																updateItemWeight(index, 0);
															} else if (numValue > 100) {
																updateItemWeight(index, 100);
															}
														}}
													/>
												</div>
											</div>
										))}
								</div>

								<div className="px-4 mt-4 space-y-1">
									<p className="text-orange-600 text-sm font-medium">
										Tổng cộng: {items.length} mục (tối đa 12 mục)
									</p>
									<p className="text-orange-600 text-sm font-medium">
										Tổng tỉ lệ: {items.reduce((sum, item) => sum + item.weight, 0)}%
									</p>
									<p className="text-xs text-orange-500 italic">
										💡 Tỉ lệ càng cao, khả năng trúng càng lớn (0-100)
									</p>
								</div>
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
									<li>🎊 Nhấn &quot;QUAY NGAY!&quot; để bắt đầu quay</li>
									<li>🎉 Vòng quay sẽ dừng và hiển thị kết quả</li>
									<li>🔄 Sử dụng &quot;Reset&quot; để đặt lại vòng quay</li>
									<li>📝 Tối thiểu 2 mục, tối đa 12 mục</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
