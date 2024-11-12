'use client'

import { motion, useAnimationControls } from "framer-motion"
import { useEffect, useState } from "react"
import { NavigationLink } from "./NavigationLink"
import { ChevronRight, Home, Settings, User, HelpCircle } from 'lucide-react'
import { UserButton } from "./UserButton"

const containerVariants = {
  close: {
    width: "5rem",
    transition: {
      type: "spring",
      damping: 15,
      duration: 0.5,
    },
  },
  open: {
    width: "16rem",
    transition: {
      type: "spring",
      damping: 15,
      duration: 0.5,
    },
  },
}

const chevronVariants = {
  close: {
    rotate: 0,
  },
  open: {
    rotate: 180,
  },
}

const navItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: User, label: 'Profile' },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
]

export const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const containerControls = useAnimationControls()
  const chevronControls = useAnimationControls()

  useEffect(() => {
    if (isOpen) {
      containerControls.start("open")
      chevronControls.start("open")
    } else {
      containerControls.start("close")
      chevronControls.start("close")
    }
  }, [isOpen, containerControls, chevronControls])

  const handleOpenClose = () => {
    setIsOpen(!isOpen)
    setSelectedItem(null)
  }

  return (
    <motion.nav
      variants={containerVariants}
      animate={containerControls}
      initial="close"
      className="bg-white/10 backdrop-blur-lg flex flex-col z-10 gap-20 p-5 fixed top-0 left-0 h-full shadow-[0_0_15px_rgba(0,0,0,0.1)] border-r border-white/20"
    >
      <div className="flex flex-row w-full justify-between items-center">
        <button
          className="p-1 rounded-full flex text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          onClick={handleOpenClose}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <motion.div
            variants={chevronVariants}
            animate={chevronControls}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ChevronRight className="w-8 h-8" />
          </motion.div>
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {navItems.map((item) => (
          <NavigationLink
            key={item.label}
            name={item.label}
            isActive={selectedItem === item.label}
            onClick={() => setSelectedItem(item.label)}
          >
            <item.icon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
          </NavigationLink>
        ))}
      </div>
      <UserButton />
    </motion.nav>
  )
}