"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Gavel, Loader2, Lock, User } from "lucide-react"

export default function JudgesLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Nếu đã đăng nhập rồi thì chuyển thẳng vào dashboard
    try {
      const raw = localStorage.getItem("judge_profile")
      if (raw) router.replace("/judges")
    } catch {}
    // Focus vào ô username
    userRef.current?.focus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = new URL("https://unibackend.iuptit.com/api/v1/judges/judges/authenticate")
      url.searchParams.set("username", username)
      url.searchParams.set("password", password)

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        mode: "cors",
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error(`Đăng nhập thất bại (${res.status})`)
      }
      const data = await res.json()
      if (!data?.success) {
        throw new Error(data?.message || "Tên đăng nhập hoặc mật khẩu không đúng")
      }

      // Lưu phiên đăng nhập tạm thời (localStorage). Backend hiện chưa trả token.
      localStorage.setItem("judge_profile", JSON.stringify(data.data))

      router.replace("/judges")
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
            <Gavel className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập Giám Khảo</CardTitle>
          <CardDescription>Truy cập bảng chấm điểm AIC 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                  ref={userRef}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <Link href="/" className="underline">
                Về trang chủ
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


