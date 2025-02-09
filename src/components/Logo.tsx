import React from 'react'

export default function Logo() {
  return (
    <svg width="64" height="64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,80 100,30 150,80" fill="none" stroke="#2b2b2b" strokeWidth="4" />
      <rect x="60" y="80" width="80" height="60" fill="none" stroke="#2b2b2b" strokeWidth="4" />
      <text x="100" y="120" textAnchor="middle" fontFamily="Arial" fontSize="32" fill="#2b2b2b">
        $
      </text>
    </svg>
  )
}
