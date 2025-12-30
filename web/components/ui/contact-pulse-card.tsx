"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, LucideIcon } from "lucide-react";

interface ContactItem {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
}

interface ContactPulseCardProps {
  contacts?: ContactItem[];
  title?: string;
  subtitle?: string;
  lightColor?: string;
}

const defaultContacts: ContactItem[] = [
  {
    icon: Phone,
    title: "WhatsApp",
    value: "(61) 9 8147-1038",
    href: "https://wa.me/5561981471038",
  },
  {
    icon: Mail,
    title: "Email",
    value: "contato@abracanm.org.br",
    href: "mailto:contato@abracanm.org.br",
  },
  {
    icon: MapPin,
    title: "Localização",
    value: "São Paulo, SP",
  },
];

export function ContactPulseCard({
  contacts = defaultContacts,
  title = "Entre em contato",
  subtitle = "Estamos aqui para ajudar você.",
  lightColor = "#A8C686",
}: ContactPulseCardProps) {
  const orbitRadius = 140;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      <div className="relative">
        <div className="relative mx-auto" style={{ width: 400, height: 400 }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 400 400"
          >
            <defs>
              <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {[80, 120, 160].map((radius, i) => (
              <motion.circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={lightColor}
                strokeOpacity="0.1"
                strokeWidth="1"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              />
            ))}

            {[0, 1, 2, 3].map((i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx={centerX}
                cy={centerY}
                r="60"
                fill="none"
                stroke={lightColor}
                strokeWidth="1"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.circle
              cx={centerX}
              cy={centerY}
              r="40"
              fill={lightColor}
              fillOpacity="0.1"
            />
            <motion.circle
              cx={centerX}
              cy={centerY}
              r="25"
              fill={lightColor}
              fillOpacity="0.2"
            />
            <motion.circle
              cx={centerX}
              cy={centerY}
              r="12"
              fill={lightColor}
              filter="url(#pulseGlow)"
            />

            {contacts.map((_, index) => {
              const angle = (index / contacts.length) * Math.PI * 2 - Math.PI / 2;
              const x = centerX + Math.cos(angle) * orbitRadius;
              const y = centerY + Math.sin(angle) * orbitRadius;
              
              return (
                <g key={index}>
                  <motion.line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={lightColor}
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.15 }}
                    viewport={{ once: true }}
                  />

                  <motion.circle
                    cx="0"
                    cy="0"
                    r="4"
                    fill={lightColor}
                    filter="url(#pulseGlow)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <animateMotion
                      dur={`${2 + index * 0.3}s`}
                      repeatCount="indefinite"
                      path={`M ${centerX} ${centerY} L ${x} ${y}`}
                    />
                  </motion.circle>
                </g>
              );
            })}
          </svg>

          {contacts.map((contact, index) => {
            const angle = (index / contacts.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * orbitRadius;
            const y = centerY + Math.sin(angle) * orbitRadius;
            const Icon = contact.icon;
            const OrbitWrapper = contact.href ? "a" : "div";
            
            return (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: x - 36,
                  top: y - 36,
                  width: 72,
                  height: 72,
                }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.15 }}
                viewport={{ once: true }}
              >
                <OrbitWrapper
                  href={contact.href}
                  target={contact.href?.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={`${contact.title}: ${contact.value}`}
                  className="group relative w-full h-full block focus:outline-none focus:ring-2 focus:ring-[#A8C686] rounded-full"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${lightColor}10`, border: `1px solid ${lightColor}30` }}
                    whileHover={{ scale: 1.1, backgroundColor: `${lightColor}20` }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `1px solid ${lightColor}` }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: 1.4, opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="w-6 h-6" style={{ color: lightColor }} />
                  </div>
                </OrbitWrapper>
              </motion.div>
            );
          })}

          <motion.div
            className="absolute flex items-center justify-center"
            style={{
              left: centerX - 30,
              top: centerY - 30,
              width: 60,
              height: 60,
            }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-white font-bold text-sm">ABRACANM</span>
          </motion.div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            const Wrapper = contact.href ? "a" : "div";
            
            return (
              <Wrapper
                key={index}
                href={contact.href}
                target={contact.href?.startsWith("http") ? "_blank" : undefined}
                rel={contact.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group text-center"
              >
                <div className="relative inline-flex flex-col items-center">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${lightColor}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: lightColor }} />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{contact.title}</h3>
                  <p className="text-white/80 group-hover:text-white transition-colors">{contact.value}</p>
                </div>
              </Wrapper>
            );
          })}
        </motion.div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: lightColor }} />
    </div>
  );
}

export default ContactPulseCard;
