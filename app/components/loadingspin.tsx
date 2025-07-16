// components/LoadingState.tsx
"use client"; // Mark this as a Client Component

import Loading from "./loading";
import { useSession } from "next-auth/react";

export default function LoadingState({ children }: { children: React.ReactNode }) {
const {data:session,status } =useSession()


  return session ==null && status==="loading" ? <Loading /> : <>{children}</>;
}