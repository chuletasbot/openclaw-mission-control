'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const LiquidGlass = dynamic(() => import('liquid-glass-react'), { ssr: false })

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <LiquidGlass
      cornerRadius={16}
      blurAmount={20}
      saturation={1.5}
      displacementScale={3}
      aberrationIntensity={1}
      className={`glass-card p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </LiquidGlass>
  )
}
