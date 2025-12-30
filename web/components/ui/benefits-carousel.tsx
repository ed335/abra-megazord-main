"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Benefit {
  title: string;
  description: string;
}

interface BenefitsCarouselProps {
  benefits: Benefit[];
}

export function BenefitsCarousel({ benefits }: BenefitsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(benefits.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const currentBenefits = benefits.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {currentBenefits.map((benefit, index) => (
              <div
                key={`${currentIndex}-${index}`}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#3FA174]/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-5 w-5 text-[#3FA174]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#3FA174] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir para página ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#3FA174] transition-colors group"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#3FA174]" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-[#3FA174] transition-colors group"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#3FA174]" />
          </button>
        </div>
      </div>
    </div>
  );
}
