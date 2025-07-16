/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  Calendar, 
  BarChart3, 
  UserCog,
  Building2,
  ClipboardList,
  BriefcaseIcon
} from "lucide-react";
import { Suspense } from "react";

import HeroTitle from "./components/rendercompount/Herotitle";
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details?: string; // ✅ Make details optional
}
export default function Home() {
  const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, details }) => (
    <Card className="p-6 bg-white/70 backdrop-blur-md shadow-xl rounded-2xl hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4 text-blue-600 text-2xl shadow">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-blue-900">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {details && <p className="text-blue-500 text-sm mt-2 font-semibold">{details}</p>}
    </Card>
  );
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-64 z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-full">
          <path fill="#2563eb" fillOpacity="0.2" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>
      <section className="relative px-4 py-28 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
      
        <div className="mt-8 flex flex-col items-center justify-center">
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Streamline employee management, time tracking, performance reviews, and more with our comprehensive HR platform designed for businesses of all sizes.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <img src="../image1.png" alt="user1" className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2 first:ml-0" />
            <img src="../k.png" alt="user2" className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2" />
            <img src="../OiP.jpeg" alt="user3" className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2" />
            <img src="../OiP (1).jpeg" alt="user4" className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2" />
            <img src="../R.jpeg" alt="user5" className="w-10 h-10 rounded-full border-2 border-white shadow -ml-2" />
            <span className="ml-4 text-gray-500 text-base font-medium">Trusted by 10,000+ businesses worldwide</span>
          </div>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg animate-glow">
            Dashboard <BarChart3 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-blue-500 text-blue-700 hover:bg-blue-100">
            View Reports
          </Button>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={<Users />} title="Employee Directory" description="View and manage employee profiles" details="238 Active Employees" />
          <FeatureCard icon={<Clock />} title="Time Tracking" description="Monitor attendance and hours" details="Real-time Updates" />
          <FeatureCard icon={<Calendar />} title="Leave Management" description="Handle time-off requests" details="12 Pending Requests" />
          <FeatureCard icon={<UserCog />} title="Performance" description="Track goals and reviews" details="Q2 Reviews Due" />
        </div>
      </section>
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 to-blue-300/30 rounded-3xl blur-2xl -z-10"></div>
        <h2 className="text-3xl font-extrabold text-center mb-14 text-blue-900 drop-shadow">Comprehensive HR Management</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={<Building2 />} title="Department Management" description="Organize employees by departments, track budgets, and manage team structures effectively." />
          <FeatureCard icon={<ClipboardList />} title="Attendance Tracking" description="Advanced time tracking with automated attendance marking and leave management." />
          <FeatureCard icon={<BriefcaseIcon />} title="Performance Reviews" description="Set KPIs, conduct reviews, and track employee performance metrics." />
        </div>
      </section>
      <section className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 py-24 px-4 sm:px-6 lg:px-8 relative z-30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow mb-6 animate-fade-in">Ready to streamline your HR operations?</h2>
          <p className="mt-6 text-lg leading-8 text-blue-100 max-w-2xl mx-auto animate-fade-in delay-100">
            Join leading companies using our system to manage their workforce efficiently.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in delay-200">
            <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-blue-100 font-bold shadow-lg animate-glow">
              Get Started Now
            </Button>
            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold shadow-lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}


