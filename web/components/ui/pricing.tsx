"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Planos e Preços",
  description = "Escolha o plano ideal para você",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#3FA174", "#6EC1E4", "#10B981", "#34D399"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={cn(
          "text-sm font-medium transition-colors",
          isMonthly ? "text-gray-900" : "text-gray-400"
        )}>
          Mensal
        </span>
        <Switch
          ref={switchRef as React.RefObject<HTMLButtonElement>}
          checked={!isMonthly}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-[#3FA174]"
        />
        <span className={cn(
          "text-sm font-medium transition-colors",
          !isMonthly ? "text-gray-900" : "text-gray-400"
        )}>
          Anual
        </span>
        <span className={cn(
          "ml-2 text-xs font-medium px-2 py-1 rounded-full transition-opacity",
          !isMonthly 
            ? "text-[#3FA174] bg-[#3FA174]/10 opacity-100" 
            : "opacity-0"
        )}>
          20% OFF
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
              "relative rounded-2xl border bg-white p-6 flex flex-col",
              plan.isPopular 
                ? "border-[#3FA174] border-2 shadow-lg shadow-[#3FA174]/10" 
                : "border-gray-200"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-[#3FA174] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  Mais Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {plan.name}
              </h3>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-gray-900">
                  R$ <NumberFlow 
                    value={Number(isMonthly ? plan.price : plan.yearlyPrice)} 
                    format={{ minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                    transformTiming={{ duration: 500, easing: 'ease-out' }}
                    spinTiming={{ duration: 500, easing: 'ease-out' }}
                  />
                </span>
                <span className="text-gray-500 text-sm">
                  /{plan.period}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                {isMonthly ? "cobrado mensalmente" : "cobrado anualmente"}
              </p>
            </div>

            <div className="flex-1">
              <ul className="space-y-3 mb-6">
                {plan.features.slice(0, 6).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#3FA174]/10 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-[#3FA174]" />
                    </div>
                    <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 6 && (
                  <li className="text-xs text-gray-400 pl-6">
                    +{plan.features.length - 6} benefícios adicionais
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-auto">
              <Button
                asChild
                className={cn(
                  "w-full font-semibold",
                  plan.isPopular
                    ? "bg-[#3FA174] hover:bg-[#358c64] text-white"
                    : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
                )}
              >
                <Link href={plan.href}>
                  {plan.buttonText}
                </Link>
              </Button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
