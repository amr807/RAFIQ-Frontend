"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"

const SigninButton = () => {
  const { data: session } = useSession()
  const router = useRouter()

  if (session && session.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <User className="h-5 w-5" />
          </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="font-medium">{session.user.name}</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-account/User/settings">
              <Settings className="mr-2 h-4 w-4" />
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={async () => {
         await signOut({redirect: false})
          router.push("/login") 
        }
          
          }>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button variant="ghost" onClick={() => signIn()}>
        Sign In
      </Button></motion.div>
      <Button asChild>
        <Link href="/signup">Create account</Link>
      </Button>
      
    </div>
  )
}

export default SigninButton

