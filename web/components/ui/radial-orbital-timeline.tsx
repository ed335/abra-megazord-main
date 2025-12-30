"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: number
  title: string
  description: string
  date?: string
  icon?: React.ReactNode
}

interface RadialOrbitalTimelineProps {
  items: TimelineItem[]
  className?: string
}

export function RadialOrbitalTimeline({
  items,
  className,
}: RadialOrbitalTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop - Horizontal Timeline */}
      <div className="hidden md:block">
        <div className="relative max-w-4xl mx-auto">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#3FA174] to-[#6EC1E4]"
              initial={{ width: "0%" }}
              animate={{ width: `${(activeIndex / (items.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Timeline Items */}
          <div className="relative flex justify-between">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex flex-col items-center cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => setActiveIndex(index)}
              >
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                    index <= activeIndex 
                      ? "bg-[#3FA174] text-white shadow-lg shadow-[#3FA174]/30" 
                      : "bg-white border-2 border-gray-200 text-gray-400 group-hover:border-[#3FA174]/50"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon ? (
                    <span className="w-6 h-6 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">{item.icon}</span>
                  ) : (
                    <span className="text-xl font-bold">{index + 1}</span>
                  )}
                  
                  {/* Pulse animation for active */}
                  {index === activeIndex && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#3FA174]"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="mt-4 text-center max-w-[120px]">
                  <span className="text-xs text-[#3FA174] font-medium">{item.date}</span>
                  <h4 className={cn(
                    "text-sm font-semibold mt-1 transition-colors",
                    index <= activeIndex ? "text-gray-900" : "text-gray-400"
                  )}>
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active Item Details */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-8 py-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-[#3FA174]/10 flex items-center justify-center text-[#3FA174] [&>svg]:w-6 [&>svg]:h-6">
                {items[activeIndex].icon || <span className="text-xl font-bold">{activeIndex + 1}</span>}
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">{items[activeIndex].title}</h3>
                <p className="text-sm text-gray-600">{items[activeIndex].description}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile - Vertical Timeline */}
      <div className="md:hidden">
        <div className="relative pl-8">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200">
            <motion.div 
              className="w-full bg-gradient-to-b from-[#3FA174] to-[#6EC1E4]"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            />
          </div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                {/* Circle Marker */}
                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-[#3FA174] flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {index + 1}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#3FA174]/30 transition-all">
                  <div className="flex items-start gap-3">
                    {item.icon && (
                      <div className="w-10 h-10 rounded-lg bg-[#3FA174]/10 flex items-center justify-center text-[#3FA174] flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5">
                        {item.icon}
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-[#3FA174] font-medium">{item.date}</span>
                      <h4 className="text-base font-semibold text-gray-900 mt-0.5">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
