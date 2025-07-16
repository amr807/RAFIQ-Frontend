/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { fetchImage } from "@/app/components/fetchfrom_BE/Fetch_image"
import {
  Loader2,
  BarChart3,
  Users,
  CheckCircle,
  Shield,
  Edit,
  Sun,
  Moon,
  Activity,
  Eye,
  Building2,
  Briefcase,
  UserCircle,
  Mail,
  Sparkles,
  Award,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import AnimatedFormField from "@/components/Animation"
import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import fetchpin from "@/app/components/fetchfrom_BE/fetch_pin"
import Head from "next/head"
import PinSection from "@/app/components/pin"

export default function ManagerccontextSettings() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  const [pin, setPin] = useState<string>("")
  const [activeTab, setActiveTab] = useState("profile")

  // Manager Information State
  const [managerInfo, setManagerInfo] = useState({
    position: " Manager",
    yearsOfExperience: "8",
    teamSize: "15",
    projectsManaged: "12",
    officeLocation: "Main Office - Floor 3",
    workSchedule: "Full-time",
    reportingTo: "HR Director",
    employeeId: "MGR-2024-001",
    department: "Human Resources",
    team: "Employee Management",
    bio: "Experienced manager focused on employee development and team success. Dedicated to creating a positive work environment and supporting team growth.",
    directReports: "5",
    tasksAssigned: "12",
    completedTasks: "8",
  })

  // Performance Data
  const performanceData = [
    { month: "Jan", tasks: 12, completed: 8 },
    { month: "Feb", tasks: 15, completed: 12 },
    { month: "Mar", tasks: 18, completed: 15 },
    { month: "Apr", tasks: 14, completed: 11 },
    { month: "May", tasks: 16, completed: 14 },
  ]

  // Fetch PIN
  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await fetchpin(String(session?.user?.email))
        if (res != null) {
          setPin(res)
        } else {
          throw new Error("Network response was not ok")
        }
      } catch (error) {
        console.error("Error fetching PIN:", error)
        toast({
          title: "Error",
          description: "Failed to fetch PIN. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (session?.user?.email) {
      fetchPin()
    }
  }, [session?.user?.email, toast])

  // Handle image fetching
  useEffect(() => {
    const fetchUserImage = async () => {
      if (!session?.user?.email) return

      try {
        setIsLoading(true)
        const res = await fetchImage(session.user.email)
        if (res) {
          setImage(res)
        } else {
          console.log("Image not found")
          setImage(null)
        }
      } catch (error) {
        console.error("Error fetching image:", error)
        setImage(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserImage()
  }, [session?.user?.email])

  // Handle PIN change
  const handlePinChange = async (newPin: string) => {
    setPin(newPin)
  }

  // Handle profile update
  const handleProfileUpdate = () => {
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
      variant: "success",
    })
  }

  // Handle session check
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-card rounded-xl shadow-lg border border-primary/10 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Please sign in to view your profile
          </h2>
          <p className="text-muted-foreground">You need to be authenticated to access this page.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Manager Settings</title>
        <meta name="description" content="Manage your profile, security, and team information." />
        <meta property="og:title" content="Manager Settings" />
        <meta property="og:description" content="Manage your profile, security, and team information." />
        <meta property="og:image" content="/manager-icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Manager Settings" />
        <meta name="twitter:description" content="Manage your profile, security, and team information." />
        <meta name="twitter:image" content="/manager-icon.png" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl px-4"
        >
          <Card className="shadow-xl border-primary/10 overflow-hidden bg-card/95 backdrop-blur-sm">
            <CardHeader className="relative pb-0">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-purple-500/10 via-teal-500/10 to-purple-500/10 opacity-50" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-4 pt-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-teal-500/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                    {isLoading ? (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <Avatar className="w-24 h-24 border-2 border-background shadow-lg relative z-10">
                        <AvatarImage src={image || ""} className="object-cover" alt="Profile" />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-teal-500 text-white font-bold">
                          {session?.user?.name?.[0]?.toUpperCase() || "M"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-center md:text-left space-y-1"
                  >
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent">
                      {session?.user?.name}
                    </CardTitle>
                    <p className="text-muted-foreground">{session?.user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-1">
                      <Badge className="px-2 py-1 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors">
                        {managerInfo.position}
                      </Badge>
                      <Badge className="px-2 py-1 bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 transition-colors">
                        Reports to: {managerInfo.reportingTo}
                      </Badge>
                    </div>
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full mt-6"
              >
                <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 w-full bg-muted/50">
                    <TabsTrigger
                      value="profile"
                      className="flex items-center gap-1 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="stats"
                      className="flex items-center gap-1 data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-500"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Statistics</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="flex items-center gap-1 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </motion.div>
            </CardHeader>

            <CardContent className="pt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === "profile" && (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-teal-500/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                          {isLoading ? (
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <Avatar className="w-32 h-32 border-4 border-background shadow-lg relative z-10">
                              <AvatarImage src={image || ""} className="object-cover" alt="Profile" />
                              <AvatarFallback className="text-3xl bg-gradient-to-br from-purple-500 to-teal-500 text-white font-bold">
                                {session?.user?.name?.[0]?.toUpperCase() || "M"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                            onClick={() => document.getElementById("profile-upload")?.click()}
                          >
                            <Edit className="h-4 w-4" />
                            Change Profile Picture
                          </Button>
                          <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size of 2MB</p>
                        </div>

                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast({
                                  title: "File too large",
                                  description: "Please select an image smaller than 2MB",
                                  variant: "destructive",
                                })
                                return
                              }

                              try {
                                setIsLoading(true)
                                const formData = new FormData()
                                formData.append("image", file)
                                formData.append("email", session?.user?.email || "")

                                const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/upload-profile`, {
                                  method: "POST",
                                  body: formData,
                                })

                                if (response.ok) {
                                  const data = await response.json()
                                  setImage(data.imageUrl)
                                  toast({
                                    title: "Success",
                                    description: "Profile picture updated successfully",
                                    variant: "success",
                                  })
                                } else {
                                  throw new Error("Failed to upload image")
                                }
                              } catch (error) {
                                console.error("Error uploading image:", error)
                                toast({
                                  title: "Error",
                                  description: "Failed to upload profile picture. Please try again.",
                                  variant: "destructive",
                                })
                              } finally {
                                setIsLoading(false)
                              }
                            }
                          }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-purple-500" />
                            Professional Information
                          </h3>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-muted-foreground hover:text-purple-500"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AnimatedFormField
                            label="Position"
                            value={managerInfo.position}
                            onChange={(e) => setManagerInfo({ ...managerInfo, position: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your position"
                          />
                          <AnimatedFormField
                            label="Employee ID"
                            value={managerInfo.employeeId}
                            onChange={() => {}}
                            disabled={true}
                            placeholder="Employee ID"
                          />
                          <AnimatedFormField
                            label="Years of Experience"
                            value={managerInfo.yearsOfExperience}
                            onChange={(e) => setManagerInfo({ ...managerInfo, yearsOfExperience: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Years of experience"
                          />
                          <AnimatedFormField
                            label="Reporting To"
                            value={managerInfo.reportingTo}
                            onChange={(e) => setManagerInfo({ ...managerInfo, reportingTo: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your supervisor"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <Users className="h-5 w-5 text-teal-500" />
                            Team Management
                          </h3>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-muted-foreground hover:text-teal-500"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AnimatedFormField
                            label="Department"
                            value={managerInfo.department}
                            onChange={(e) => setManagerInfo({ ...managerInfo, department: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your department"
                          />
                          <AnimatedFormField
                            label="Team"
                            value={managerInfo.team}
                            onChange={(e) => setManagerInfo({ ...managerInfo, team: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your team"
                          />
                          <AnimatedFormField
                            label="Team Size"
                            value={managerInfo.teamSize}
                            onChange={(e) => setManagerInfo({ ...managerInfo, teamSize: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Number of team members"
                          />
                          <AnimatedFormField
                            label="Projects Managed"
                            value={managerInfo.projectsManaged}
                            onChange={(e) => setManagerInfo({ ...managerInfo, projectsManaged: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Number of active projects"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-500" />
                            Work Details
                          </h3>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-muted-foreground hover:text-purple-500"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <AnimatedFormField
                            label="Office Location"
                            value={managerInfo.officeLocation}
                            onChange={(e) => setManagerInfo({ ...managerInfo, officeLocation: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your office location"
                          />
                          <AnimatedFormField
                            label="Work Schedule"
                            value={managerInfo.workSchedule}
                            onChange={(e) => setManagerInfo({ ...managerInfo, workSchedule: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Your work schedule"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-teal-500" />
                            About Me
                          </h3>
                          {!isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-muted-foreground hover:text-teal-500"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <AnimatedFormField
                          label="Bio"
                          value={managerInfo.bio}
                          onChange={(e) => setManagerInfo({ ...managerInfo, bio: e.target.value })}
                          multiline
                          rows={3}
                          disabled={!isEditing}
                          placeholder="Tell us about yourself..."
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex justify-end gap-2 pt-4 border-t"
                      >
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleProfileUpdate}
                              className="gap-1 bg-gradient-to-r from-purple-500 to-teal-500 hover:opacity-90"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="gap-1 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </Button>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {activeTab === "stats" && (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-80 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl p-4 border border-muted shadow-sm"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-500" />
                          Performance Overview
                        </h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                borderRadius: "8px",
                                border: "1px solid rgba(139, 92, 246, 0.2)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="tasks"
                              stroke="#8b5cf6"
                              strokeWidth={2}
                              name="Tasks"
                              activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="completed"
                              stroke="#14b8a6"
                              strokeWidth={2}
                              name="Completed"
                              activeDot={{ r: 6, fill: "#14b8a6", stroke: "#fff" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </motion.div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          whileHover={{ scale: 1.03 }}
                          className="p-6 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl shadow-sm border border-purple-500/10"
                        >
                          <div className="flex flex-col items-center text-center">
                            <Users className="h-8 w-8 text-purple-500 mb-2" />
                            <h3 className="text-3xl font-bold text-purple-500">{managerInfo.directReports}</h3>
                            <p className="text-sm text-muted-foreground">Direct Reports</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          whileHover={{ scale: 1.03 }}
                          className="p-6 bg-gradient-to-br from-teal-500/5 to-teal-500/10 rounded-xl shadow-sm border border-teal-500/10"
                        >
                          <div className="flex flex-col items-center text-center">
                            <BarChart3 className="h-8 w-8 text-teal-500 mb-2" />
                            <h3 className="text-3xl font-bold text-teal-500">{managerInfo.tasksAssigned}</h3>
                            <p className="text-sm text-muted-foreground">Tasks Assigned</p>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          whileHover={{ scale: 1.03 }}
                          className="p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl shadow-sm border border-emerald-500/10"
                        >
                          <div className="flex flex-col items-center text-center">
                            <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
                            <h3 className="text-3xl font-bold text-emerald-600">{managerInfo.completedTasks}</h3>
                            <p className="text-sm text-muted-foreground">Completed Tasks</p>
                          </div>
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl shadow-sm border border-muted">
                          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            Performance Metrics
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Team Productivity</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                                style={{ width: "85%" }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm">Project Completion Rate</span>
                              <span className="text-sm font-medium">92%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                                style={{ width: "92%" }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm">Team Satisfaction</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
                                style={{ width: "78%" }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl shadow-sm border border-muted">
                          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-teal-500" />
                            Recent Activity
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Project Review Completed</p>
                                <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Team Meeting Scheduled</p>
                                <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Performance Reviews Started</p>
                                <p className="text-xs text-muted-foreground">May 5, 9:00 AM</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Budget Approval Received</p>
                                <p className="text-xs text-muted-foreground">May 3, 11:45 AM</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl border border-muted shadow-sm"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-500" />
                          Employee Access PIN
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This PIN allows new employees to create accounts under your management. Share it securely with
                          team members during onboarding.
                        </p>

                        <PinSection pin={pin} onPinChange={handlePinChange} />
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl border border-muted shadow-sm"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-teal-500" />
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add an extra layer of security to your account by enabling two-factor authentication.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="2fa" />
                            <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
                          </div>
                          <Button
                            variant="outline"
                            className="border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500"
                          >
                            Setup
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl border border-muted shadow-sm"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-500" />
                          Active Sessions
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          View and manage your active sessions across different devices.
                        </p>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-muted">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <div>
                                <p className="text-sm font-medium">Current Session</p>
                                <p className="text-xs text-muted-foreground">Chrome on Windows • IP: 192.168.1.1</p>
                              </div>
                            </div>
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-muted">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                              <div>
                                <p className="text-sm font-medium">Mobile App</p>
                                <p className="text-xs text-muted-foreground">iPhone 13 • IP: 192.168.1.2</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                              Revoke
                            </Button>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full sm:w-auto border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500"
                          >
                            View All Sessions
                          </Button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="p-6 bg-gradient-to-br from-purple-500/5 to-teal-500/5 rounded-xl border border-muted shadow-sm"
                      >
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <Eye className="h-5 w-5 text-teal-500" />
                          Password Management
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Update your password regularly to maintain account security.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500"
                        >
                          Change Password
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t bg-gradient-to-r from-purple-500/5 to-teal-500/5 px-6 py-4">
              <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-1 hover:text-purple-500">
                  <Mail className="h-4 w-4" />
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="hover:text-teal-500"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
