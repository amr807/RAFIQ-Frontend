/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/prefer-as-const */
"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Navbares from "./Navbares"
import SigninButton from "./Signbutoon"
import Bill from "./Bill"
import Language from "./Language"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const controls = useAnimation()

  // Colors for the text animation
  const colors = [
    "from-blue-600 to-purple-600",
    "from-pink-500 to-orange-500",
    "from-green-500 to-teal-500",
    "from-purple-600 to-pink-500",
    "from-yellow-500 to-red-500",
  ]

  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto animation cycle
  useEffect(() => {
    const animationSequence = async () => {
      // Start with letters appearing
      await controls.start("visible")

      // Wait a bit with normal state
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Do wave animation
      await controls.start("wave")

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Change color
      setCurrentColorIndex((prev) => (prev + 1) % colors.length)

      // Reset and restart animation cycle
      await controls.start("reset")
      setAnimationKey((prev) => prev + 1)
    }

    animationSequence()

    // Set interval for continuous animation
    const interval = setInterval(() => {
      animationSequence()
    }, 5000)

    return () => clearInterval(interval)
  }, [animationKey, controls])

  // Animation variants for the RAFIQ text
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    wave: (i: number) => ({
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      transition: {
        delay: i * 0.06,
        duration: 0.6,
        ease: "easeInOut",
      },
    }),
    reset: {
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      y: -5,
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  }

  const logoVariants = {
    initial: { rotate: 0 },
    hover: { rotate: 10, scale: 1.1, transition: { duration: 0.3 } },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as "reverse",
        duration: 1.5,
      },
    },
  }

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-gradient-to-r from-white to-gray-50 border-b border-gray-100",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-1 flex items-center justify-between">
            <Link href="/my-account/User/dashboard" className="flex items-center space-x-3 group">
              <motion.div
                initial="initial"
                animate="pulse"
                whileHover="hover"
                variants={logoVariants}
                className="relative"
              >
                <Image
                  src="../../1711a58d-7655-4ff9-9c3a-831a565f2459.svg"
                  alt="RAFIQ System Logo"
                  width={55}
                  height={55}
                  className="transition-all"
                />
              </motion.div>

              <div className="flex overflow-hidden">
                {["R", "A", "F", "I", "Q"].map((letter, i) => (
                  <motion.span
                    key={`${letter}-${animationKey}-${i}`}
                    custom={i}
                    initial="hidden"
                    animate={controls}
                    whileHover="hover"
                    variants={letterVariants}
                    className={cn(
                      "text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-br",
                      colors[currentColorIndex],
                    )}
                  >
                    {letter}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [-10, 0, 10],
                    transition: {
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      repeatDelay: 1,
                    },
                  }}
                  className="ml-2 text-sm font-medium text-gray-500"
                >
                </motion.span>
              </div>
            </Link>

            <div className="hidden md:flex md:justify-center md:flex-1">
              <Navbares />
            </div>

            <div className="hidden md:flex items-center space-x-5">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Bill />
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SigninButton />
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Language />
              </motion.div>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Bill />
            </motion.div>

            <Sheet>
              <SheetTrigger asChild>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:bg-gray-100 rounded-full h-10 w-10"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    <span className="sr-only">Open menu</span>
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-gray-200">
                <div className="flex flex-col h-full">
                  <div className="py-6 border-b border-gray-100">
                    <Link href="/my-account/User/dashboard" className="flex items-center space-x-2">
                      <Image
                        src="../../1711a58d-7655-4ff9-9c3a-831a565f2459.svg"
                        alt="RAFIQ System Logo"
                        width={40}
                        height={40}
                      />
                      <span
                        className={cn(
                          "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r",
                          colors[currentColorIndex],
                        )}
                      >
                        RAFIQ
                      </span>
                    </Link>
                  </div>
                  <div className="flex-grow mt-6">
                    <Navbares />
                  </div>
                  <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                    <SigninButton />
                    <Language />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
