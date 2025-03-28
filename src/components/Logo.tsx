'use client'
import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Always show colorful version in dark mode
  const showColor = isHovered || isDark

  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transition: 'all 0.3s ease' }}
    >
      <polygon
        points="50,80 100,30 150,80"
        fill="none"
        stroke={showColor ? '#ff6b6b' : '#2b2b2b'}
        strokeWidth="4"
        style={{ transition: 'all 0.3s ease' }}
      />
      <rect
        x="60"
        y="80"
        width="80"
        height="60"
        fill="none"
        stroke={showColor ? '#4ecdc4' : '#2b2b2b'}
        strokeWidth="4"
        style={{ transition: 'all 0.3s ease' }}
      />
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fontFamily="Arial"
        fontSize="32"
        fill={showColor ? '#ff9f43' : '#2b2b2b'}
        style={{ transition: 'all 0.3s ease' }}
      >
        $
      </text>
    </svg>
  )
}
