import React from 'react'
import { motion } from 'framer-motion'

interface NavigationLinkProps {
  name: string
  children: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ name, children, isActive, onClick }) => {
  return (
    <motion.button
      className={`flex items-center gap-4 p-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-white/20 text-white' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{name}</span>
    </motion.button>
  )
}