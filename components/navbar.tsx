"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, BookOpen, Trophy, TrendingUp, Home, LogOut, Menu, X, User } from "lucide-react"

export function Navbar() {
  const [user, setUser] = useState<{ name: string; id: string } | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userData = localStorage.getItem("gyaan_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("gyaan_user")
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/quiz", label: "Quiz", icon: Trophy },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/Writing", label: "Writing", icon: TrendingUp },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AlfaNumrik</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className="flex items-center gap-2"
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* User Menu */}
                      <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="text-sm">
                  <span className="text-gray-600">Welcome, </span>
                  <span className="font-medium">{user.name.split(' ')[0]}</span>
                </div>
              )}
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href={item.href}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}

                              <div className="pt-4 border-t border-gray-200">
                  {user && (
                    <div className="text-sm mb-3 px-3">
                      <span className="text-gray-600">Welcome, </span>
                      <span className="font-medium">{user.name.split(' ')[0]}</span>
                    </div>
                  )}
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
