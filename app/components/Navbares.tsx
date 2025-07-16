/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Navbares = () => {
  const { data: session,status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
console.log(pathname)
  const navItemslogout = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const navItemsloginManager = [
    { name: "Dashboard", href: "/my-account/User/dashboard" },
    { name: "Employees", href: "/my-account/User/employees" },
    { name: "Tasks", href: "/my-account/User/task" },
    { name: "Map", href: "/my-account/User/location" },
  ];

  const navItems = session!==null && status=="authenticated" ? navItemsloginManager: navItemslogout;
  return (
    <div className="flex md:flex-row flex-col space-y-4 md:space-y-0 md:space-x-4">
      {navItems.map((link) => (
        <motion.div
          key={link.href}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button
        onMouseUp={()=>{router.prefetch(link.href)}}
            onClick={() => router.replace(link.href)

            }
            className={cn(
              "text-m font-medium transition-colors hover:text-primary px-4 md:px-6 py-2 rounded-md relative",
              pathname === link.href
                ? "font-bold text-primary after:absolute after:left-0 after:bottom-0 after:w-full after:h-1 after:bg-white after:shadow-md"
                : "text-muted-foreground"
            )}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.name}
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default Navbares;
