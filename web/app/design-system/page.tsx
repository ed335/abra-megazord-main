"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Palette,
  Layout,
  Code,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  Sparkles,
  Copy,
  Eye,
  Terminal,
  Cpu,
  Database,
  Layers,
  Type,
  Box,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface ColorToken {
  name: string
  value: string
  usage: string
  cssVar: string
}

interface SpacingToken {
  name: string
  value: string
  usage: string
}

interface TypographyToken {
  name: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  usage: string
  className: string
}

interface ComponentSpec {
  name: string
  description: string
  variants: string[]
  states: string[]
  accessibility: string[]
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: Layout },
  { id: 'tokens', label: 'Design Tokens', icon: Palette },
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'components', label: 'Components', icon: Box },
]

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const colorTokens: ColorToken[] = [
    { name: 'Verde Oliva', value: '#6B7C59', usage: 'Primary brand color, main actions', cssVar: 'verde-oliva' },
    { name: 'Verde Claro', value: '#A8C686', usage: 'Secondary green, accents', cssVar: 'verde-claro' },
    { name: 'Verde Escuro', value: '#4A5A3A', usage: 'Hover states, emphasis', cssVar: 'verde-escuro' },
    { name: 'Dourado', value: '#D4A574', usage: 'Premium highlights, gold accents', cssVar: 'dourado' },
    { name: 'Off White', value: '#FAFAF8', usage: 'Main background', cssVar: 'off-white' },
    { name: 'Cinza Escuro', value: '#2D2D2D', usage: 'Primary text', cssVar: 'cinza-escuro' },
    { name: 'Cinza Médio', value: '#6F7278', usage: 'Secondary text, labels', cssVar: 'cinza-medio' },
    { name: 'Cinza Claro', value: '#E8E8E6', usage: 'Borders, dividers', cssVar: 'cinza-claro' },
    { name: 'Sucesso', value: '#2A7F62', usage: 'Success messages', cssVar: 'sucesso' },
    { name: 'Erro', value: '#DC2626', usage: 'Error messages', cssVar: 'erro' },
    { name: 'Aviso', value: '#D97706', usage: 'Warning messages', cssVar: 'aviso' },
    { name: 'Info', value: '#0891B2', usage: 'Informational messages', cssVar: 'info' },
  ]

  const spacingTokens: SpacingToken[] = [
    { name: 'xs', value: '4px', usage: 'Tight spacing, icon gaps' },
    { name: 'sm', value: '8px', usage: 'Small gaps, compact layouts' },
    { name: 'md', value: '12px', usage: 'Medium spacing' },
    { name: 'base', value: '16px', usage: 'Default spacing, form fields' },
    { name: 'lg', value: '24px', usage: 'Section spacing, card padding' },
    { name: 'xl', value: '32px', usage: 'Large sections, page margins' },
    { name: '2xl', value: '48px', usage: 'Major sections' },
    { name: '3xl', value: '64px', usage: 'Hero sections, large gaps' },
  ]

  const typographyTokens: TypographyToken[] = [
    { name: 'Display', fontSize: '48px', fontWeight: '700', lineHeight: '1.2', usage: 'Hero headings', className: 'text-display' },
    { name: 'Heading 2', fontSize: '36px', fontWeight: '600', lineHeight: '1.3', usage: 'Page titles', className: 'text-h2' },
    { name: 'Heading 3', fontSize: '24px', fontWeight: '600', lineHeight: '1.4', usage: 'Section headings', className: 'text-h3' },
    { name: 'Heading 4', fontSize: '18px', fontWeight: '600', lineHeight: '1.4', usage: 'Card titles', className: 'text-h4' },
    { name: 'Body Large', fontSize: '18px', fontWeight: '400', lineHeight: '1.6', usage: 'Introductions', className: 'text-body-lg' },
    { name: 'Body', fontSize: '16px', fontWeight: '400', lineHeight: '1.6', usage: 'Default text', className: 'text-body' },
    { name: 'Body Small', fontSize: '14px', fontWeight: '400', lineHeight: '1.5', usage: 'Secondary text', className: 'text-body-sm' },
    { name: 'Caption', fontSize: '12px', fontWeight: '500', lineHeight: '1.4', usage: 'Labels, hints', className: 'text-caption' },
  ]

  const componentSpecs: ComponentSpec[] = [
    {
      name: 'Button',
      description: 'Primary interactive element for actions',
      variants: ['default', 'secondary', 'ghost', 'destructive', 'outline', 'link'],
      states: ['default', 'hover', 'active', 'disabled', 'loading'],
      accessibility: ['Keyboard navigable', 'Focus visible ring', 'ARIA labels supported', 'Disabled state announced'],
    },
    {
      name: 'Card',
      description: 'Container for grouped content',
      variants: ['default', 'bordered', 'elevated'],
      states: ['default', 'hover'],
      accessibility: ['Semantic HTML structure', 'Proper heading hierarchy', 'Card slots for flexible content'],
    },
    {
      name: 'Badge',
      description: 'Status indicators and labels',
      variants: ['default', 'secondary', 'destructive', 'outline', 'success', 'warning', 'info'],
      states: ['default'],
      accessibility: ['Color-blind friendly with text', 'High contrast ratios'],
    },
    {
      name: 'Tabs',
      description: 'Organize content in switchable views',
      variants: ['default'],
      states: ['active', 'inactive', 'disabled'],
      accessibility: ['Arrow key navigation', 'Focus management', 'ARIA tab roles', 'Screen reader friendly'],
    },
    {
      name: 'Alert',
      description: 'Feedback messages for users',
      variants: ['default', 'destructive', 'success', 'warning', 'info'],
      states: ['default'],
      accessibility: ['Role=alert for screen readers', 'Icon + text for clarity', 'Dismissible support'],
    },
    {
      name: 'Progress',
      description: 'Visual progress indicator',
      variants: ['default'],
      states: ['determinate', 'indeterminate'],
      accessibility: ['ARIA progressbar role', 'Value announced', 'Color contrast compliant'],
    },
  ]

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(name)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cinza-claro">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-verde-oliva to-verde-escuro flex items-center justify-center shadow-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-cinza-escuro">ABRACANM</h1>
                <p className="text-xs text-cinza-medio">Design System v1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                Live
              </Badge>
              <Badge variant="outline">Tailwind CSS 3</Badge>
            </div>
          </div>
          
          <nav className="flex gap-1">
            {navItems.map((item, idx) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'text-verde-oliva'
                    : 'text-cinza-medio hover:text-cinza-escuro hover:bg-off-white'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-verde-oliva/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-verde-oliva/10 rounded-full border border-verde-oliva/20 mb-6"
                >
                  <Terminal className="w-4 h-4 text-verde-oliva" />
                  <span className="text-xs font-mono text-verde-oliva">SYSTEM_STATUS: OPERATIONAL</span>
                  <motion.div
                    className="w-2 h-2 rounded-full bg-verde-oliva"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <h2 className="text-4xl font-bold text-cinza-escuro mb-4">
                  Design System Overview
                </h2>
                <p className="text-lg text-cinza-medio max-w-3xl leading-relaxed">
                  A comprehensive design system for the ABRACANM healthcare platform,
                  ensuring consistency, accessibility, and scalability across all user
                  interfaces. Built with modern web technologies.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {['Next.js 14', 'React 18', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Radix UI'].map((tech, idx) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="px-3 py-1.5 bg-white rounded-lg border border-cinza-claro text-xs font-mono text-cinza-medio hover:border-verde-oliva/30 transition-colors cursor-default shadow-sm"
                    >
                      {tech}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title: 'Medical & Calm', description: 'Professional, trustworthy, human-centered design', color: 'bg-blue-50 text-blue-600' },
                  { icon: Zap, title: 'Accessible', description: 'WCAG compliant, keyboard navigable, screen reader friendly', color: 'bg-green-50 text-green-600' },
                  { icon: Layout, title: 'Consistent', description: 'Unified patterns across patient, admin, and doctor UIs', color: 'bg-purple-50 text-purple-600' },
                  { icon: Users, title: 'Scalable', description: 'Modular components ready for growth', color: 'bg-orange-50 text-orange-600' },
                ].map((principle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 hover:border-cinza-medio transition-all group">
                      <CardContent className="pt-6">
                        <motion.div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${principle.color}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <principle.icon className="w-7 h-7" />
                        </motion.div>
                        <h3 className="font-semibold text-cinza-escuro mb-2 text-lg">{principle.title}</h3>
                        <p className="text-sm text-cinza-medio leading-relaxed">{principle.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="border-2 border-cinza-claro shadow-lg overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-verde-oliva to-verde-escuro flex items-center justify-center shadow-lg">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle>Technical Specifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { text: 'White/Off-white backgrounds (no dark mode)', icon: Palette },
                    { text: 'Lucide React icons exclusively', icon: Sparkles },
                    { text: 'Border radius: rounded-xl / 2xl for modern feel', icon: Layout },
                    { text: 'Framer Motion for subtle, professional transitions', icon: Zap },
                    { text: 'Tailwind CSS 3.x utility-first styling', icon: Code },
                    { text: 'Next.js 14 App Router compatible', icon: Database },
                  ].map((feature, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-off-white transition-colors group border border-transparent hover:border-verde-oliva/10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-verde-oliva/10 flex items-center justify-center group-hover:bg-verde-oliva/20 transition-colors flex-shrink-0">
                        <feature.icon className="w-4 h-4 text-verde-oliva" />
                      </div>
                      <span className="text-cinza-medio font-mono text-sm leading-relaxed">{feature.text}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-cinza-escuro mb-4">Design Tokens</h2>
                <p className="text-lg text-cinza-medio">Core design values for consistent styling across the platform.</p>
              </div>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-verde-oliva" />
                      <CardTitle>Color Palette</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {colorTokens.map((token, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ y: -4 }}
                        onClick={() => copyToClipboard(token.value, token.name)}
                        className="border-2 border-cinza-claro rounded-2xl p-4 space-y-3 hover:border-verde-oliva/30 transition-all group cursor-pointer bg-white shadow-sm hover:shadow-md"
                      >
                        <div className="relative overflow-hidden rounded-xl">
                          <div className="w-full h-16 shadow-inner" style={{ backgroundColor: token.value }} />
                          <motion.div 
                            className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            initial={false}
                          >
                            {copiedColor === token.name ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <Copy className="w-5 h-5 text-white" />
                            )}
                          </motion.div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-cinza-escuro text-sm">{token.name}</span>
                            <span className="text-xs bg-off-white px-2 py-1 rounded-lg font-mono">{token.value}</span>
                          </div>
                          <code className="text-xs text-verde-oliva bg-verde-oliva/5 px-2 py-1 rounded block mb-2">
                            {token.cssVar}
                          </code>
                          <p className="text-xs text-cinza-medio leading-relaxed">{token.usage}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Spacing Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {spacingTokens.map((token, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 border border-cinza-claro rounded-xl">
                        <div className="w-20">
                          <code className="text-sm font-semibold text-verde-oliva">{token.name}</code>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <code className="text-sm text-cinza-medio">{token.value}</code>
                            <span className="text-sm text-cinza-medio">{token.usage}</span>
                          </div>
                        </div>
                        <div className="bg-verde-oliva h-6 rounded" style={{ width: token.value }} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Border Radius</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'rounded-sm', value: '4px', usage: 'Small elements' },
                      { name: 'rounded-md', value: '8px', usage: 'Inputs, badges' },
                      { name: 'rounded-lg', value: '12px', usage: 'Cards, buttons' },
                      { name: 'rounded-xl', value: '16px', usage: 'Large containers' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-verde-oliva" style={{ borderRadius: item.value }} />
                        <div>
                          <code className="text-sm font-semibold text-verde-oliva">{item.name}</code>
                          <p className="text-sm text-cinza-medio">{item.usage}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Shadows</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'shadow-sm', usage: 'Subtle elevation' },
                      { name: 'shadow-md', usage: 'Cards, dropdowns' },
                      { name: 'shadow-lg', usage: 'Modals, overlays' },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className={`w-full h-14 bg-white rounded-xl ${item.name}`} />
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-semibold text-verde-oliva">{item.name}</code>
                          <span className="text-sm text-cinza-medio">{item.usage}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeSection === 'typography' && (
            <motion.div
              key="typography"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-cinza-escuro mb-4">Typography System</h2>
                <p className="text-lg text-cinza-medio">Consistent text hierarchy for clear communication.</p>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Font Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="block bg-off-white p-4 rounded-lg text-sm">
                    font-family: Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, sans-serif;
                  </code>
                  <p className="text-sm text-cinza-medio mt-4">
                    Inter for optimal readability with system font fallbacks.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Type Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {typographyTokens.map((token, idx) => (
                    <div key={idx} className="border-b border-cinza-claro last:border-0 pb-6 last:pb-0">
                      <div className="mb-4">
                        <h4 className={`${token.className} text-cinza-escuro mb-2`}>
                          {token.name} Example
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-cinza-medio">
                          <span>Size: {token.fontSize}</span>
                          <span>Weight: {token.fontWeight}</span>
                          <span>Line Height: {token.lineHeight}</span>
                        </div>
                      </div>
                      <div className="bg-off-white p-4 rounded-lg">
                        <code className="text-sm text-verde-oliva">{token.className}</code>
                        <p className="text-sm text-cinza-medio mt-2">{token.usage}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeSection === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-cinza-escuro mb-4">UI Components</h2>
                <p className="text-lg text-cinza-medio">Reusable components with variants and accessibility built-in.</p>
              </div>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Zap className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Badge Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Success</Badge>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Warning</Badge>
                    <Badge variant="secondary" className="bg-sky-100 text-sky-800 border-sky-200">Info</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Alert Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertTitle>Default Alert</AlertTitle>
                    <AlertDescription>This is a default alert message.</AlertDescription>
                  </Alert>
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>Your action was completed successfully.</AlertDescription>
                  </Alert>
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>Please review this information carefully.</AlertDescription>
                  </Alert>
                  <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                  </Alert>
                  <Alert className="border-sky-200 bg-sky-50 text-sky-900">
                    <Eye className="h-4 w-4 text-sky-600" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>Here is some helpful information.</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Progress Bar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-cinza-medio mb-2">25% Complete</p>
                    <Progress value={25} />
                  </div>
                  <div>
                    <p className="text-sm text-cinza-medio mb-2">50% Complete</p>
                    <Progress value={50} />
                  </div>
                  <div>
                    <p className="text-sm text-cinza-medio mb-2">75% Complete</p>
                    <Progress value={75} />
                  </div>
                  <div>
                    <p className="text-sm text-cinza-medio mb-2">100% Complete</p>
                    <Progress value={100} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Tabs Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="specs">Specifications</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-cinza-medio">This is the overview tab content. Tabs help organize content into logical sections.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="features">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-cinza-medio">Features tab shows the main capabilities of the component.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="specs">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-cinza-medio">Technical specifications and implementation details.</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {componentSpecs.map((spec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 hover:border-verde-oliva/30 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-verde-oliva/10 flex items-center justify-center">
                                <Layout className="w-5 h-5 text-verde-oliva" />
                              </div>
                              <CardTitle>{spec.name}</CardTitle>
                            </div>
                            <CardDescription>{spec.description}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-verde-oliva/10 text-verde-oliva">
                            {spec.variants.length} variants
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="variants" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="variants">Variants</TabsTrigger>
                            <TabsTrigger value="states">States</TabsTrigger>
                            <TabsTrigger value="a11y">Accessibility</TabsTrigger>
                          </TabsList>
                          <TabsContent value="variants">
                            <div className="flex flex-wrap gap-2 pt-2">
                              {spec.variants.map((variant, vIdx) => (
                                <Badge key={vIdx} variant="outline">{variant}</Badge>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="states">
                            <div className="flex flex-wrap gap-2 pt-2">
                              {spec.states.map((state, sIdx) => (
                                <Badge key={sIdx} variant="outline">{state}</Badge>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="a11y">
                            <div className="space-y-2 pt-2">
                              {spec.accessibility.map((item, aIdx) => (
                                <div key={aIdx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-off-white transition-colors">
                                  <CheckCircle2 className="w-4 h-4 text-verde-oliva mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-cinza-medio">{item}</span>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
