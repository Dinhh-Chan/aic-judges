"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal, ArrowLeft, Loader2, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type TeamResult = {
  id: number
  teamName: string
  slogan: string
  logo: string | null
  memberCount: number
  leader: {
    name: string
    avatar?: string | null
  }
  members: Array<{
    name: string
    avatar?: string | null
  }>
  finalScore?: number
  averageScore?: number
  voteNumber?: number
}

export default function ResultsPage() {
  const [teams, setTeams] = useState<TeamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lấy Top 3 đội từ final-scores và map thông tin đội
  useEffect(() => {
    const fetchTopTeams = async () => {
      setLoading(true)
      setError(null)
      try {
        const finalScoresUrl = "https://live-code-be.ript.vn/api/v1/scores/final-scores"
        const finalRes = await fetch(finalScoresUrl, { headers: { accept: "application/json" } })
        if (!finalRes.ok) throw new Error(`Không thể tải xếp hạng (${finalRes.status})`)
        const finalBody = await finalRes.json()
        if (!finalBody?.success || !Array.isArray(finalBody?.data)) throw new Error("Dữ liệu xếp hạng không hợp lệ")

        // Lấy top 3 team_id theo final_score
        const top3 = [...finalBody.data]
          .sort((a: any, b: any) => (b.final_score ?? 0) - (a.final_score ?? 0))
          .slice(0, 3)

        const teamIds: number[] = top3.map((r: any) => r.team_id)

        // Lấy thông tin đội
        const teamsUrl = "https://live-code-be.ript.vn/api/v1/teams?limit=20&offset=0"
        const teamsRes = await fetch(teamsUrl, { headers: { accept: "application/json" } })
        if (!teamsRes.ok) throw new Error(`Không thể tải danh sách đội (${teamsRes.status})`)
        const teamsBody = await teamsRes.json()
        if (!teamsBody?.success || !Array.isArray(teamsBody?.data)) throw new Error("Dữ liệu đội không hợp lệ")

        const STATIC_BASE = "https://live-code-be.ript.vn/static/"
        const ensureStaticUrl = (path?: string | null) => {
          if (!path) return null
          if (path.startsWith("http://") || path.startsWith("https://")) return path
          return STATIC_BASE + path.replace(/^\/+/, "")
        }

        const teamsMap = new Map<number, any>()
        teamsBody.data.forEach((t: any) => teamsMap.set(t.id, t))

        const mapped: TeamResult[] = teamIds
          .map((id) => {
            const rankRow = top3.find((r: any) => r.team_id === id)
            const t = teamsMap.get(id)
            if (!t) return null
            
            const members = []
            if (t.name_member1) members.push({
              name: t.name_member1,
              avatar: ensureStaticUrl(t.url_member1) || null,
            })
            if (t.name_member2) members.push({
              name: t.name_member2,
              avatar: ensureStaticUrl(t.url_member2) || null,
            })
            if (t.name_member3) members.push({
              name: t.name_member3,
              avatar: ensureStaticUrl(t.url_member3) || null,
            })
            if (t.name_member4) members.push({
              name: t.name_member4,
              avatar: ensureStaticUrl(t.url_member4) || null,
            })

            return {
              id: t.id,
              teamName: t.team_name,
              slogan: t.slogan,
              logo: ensureStaticUrl(t.logo_url),
              memberCount: t.member_count ?? members.length + 1,
              leader: {
                name: t.name_leader || "Leader",
                avatar: ensureStaticUrl(t.url_leader) || null,
              },
              members,
              finalScore: rankRow?.final_score ? Math.round(rankRow.final_score * 10000) / 10000 : undefined,
              averageScore: rankRow?.average_score ? Math.round(rankRow.average_score) : undefined,
              voteNumber: rankRow?.vote_number,
            } as TeamResult
          })
          .filter(Boolean) as TeamResult[]

        setTeams(mapped)
      } catch (err: any) {
        setError(err.message || "Lỗi tải danh sách đội")
      } finally {
        setLoading(false)
      }
    }
    fetchTopTeams()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100">
      <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/ptit-logo.png"
                alt="PTIT Logo"
                width={40}
                height={40}
                className="bg-white rounded-lg p-1"
              />
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent">
                AIC 2025 - Kết Quả Chung Cuộc
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Về Trang Chủ
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/judges">Trang chấm điểm</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-4">
            Kết Quả Chung Cuộc
          </h1>
          <p className="text-xl text-gray-600">AIC 2025 - Top 3 Đội Xuất Sắc Nhất</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải kết quả...
          </div>
        )}
        
        {error && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>
        )}

        {!loading && teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hiển thị hạng 2 */}
            {teams.length > 1 && (
              <div className="md:order-1 md:mt-16">
                <div className="relative">
                  <Card className="border-4 border-gray-300 shadow-xl transform hover:scale-105 transition-transform">
                    <CardContent className="p-6 text-center">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gray-300 rounded-full p-4 shadow-lg">
                          <Medal className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="mt-8">
                        <Badge className="mb-2 bg-gray-300 text-gray-800">Hạng 2</Badge>
                        <Avatar className="h-24 w-24 mx-auto my-4">
                          <AvatarImage src={teams[1].logo || "/placeholder.svg"} alt={teams[1].teamName} />
                          <AvatarFallback className="text-2xl">{teams[1].teamName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold mb-1">{teams[1].teamName}</h3>
                        <p className="text-gray-600 mb-3">{teams[1].slogan}</p>
                        {typeof teams[1].finalScore === 'number' && (
                          <div className="text-lg font-semibold text-gray-700">
                            Final: {teams[1].finalScore}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {teams[1].memberCount} thành viên
                          </Badge>
                          {typeof teams[1].averageScore === 'number' && (
                            <Badge variant="secondary" className="text-sm">
                              Điểm TB: {teams[1].averageScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Hiển thị hạng 1 */}
            <div className="md:order-2">
              <div className="relative">
                <Card className="border-4 border-yellow-400 shadow-2xl transform hover:scale-105 transition-transform">
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-400 rounded-full p-5 shadow-lg">
                        <Trophy className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 bg-yellow-400 text-white text-sm px-3 py-1 rounded-full">
                      Quán quân
                    </div>
                    <div className="mt-10">
                      <Badge className="mb-2 bg-yellow-400 text-yellow-900">Hạng 1</Badge>
                      <Avatar className="h-28 w-28 mx-auto my-4 border-4 border-yellow-200">
                        <AvatarImage src={teams[0].logo || "/placeholder.svg"} alt={teams[0].teamName} />
                        <AvatarFallback className="text-2xl">{teams[0].teamName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-bold mb-1">{teams[0].teamName}</h3>
                      <p className="text-gray-600 mb-3">{teams[0].slogan}</p>
                      {typeof teams[0].finalScore === 'number' && (
                        <div className="text-xl font-semibold text-yellow-700">
                          Final: {teams[0].finalScore}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          {teams[0].memberCount} thành viên
                        </Badge>
                        {typeof teams[0].averageScore === 'number' && (
                          <Badge variant="secondary" className="text-sm">
                            Điểm TB: {teams[0].averageScore}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Hiển thị hạng 3 */}
            {teams.length > 2 && (
              <div className="md:order-3 md:mt-16">
                <div className="relative">
                  <Card className="border-4 border-orange-400 shadow-xl transform hover:scale-105 transition-transform">
                    <CardContent className="p-6 text-center">
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-orange-400 rounded-full p-4 shadow-lg">
                          <Medal className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <div className="mt-8">
                        <Badge className="mb-2 bg-orange-400 text-orange-800">Hạng 3</Badge>
                        <Avatar className="h-24 w-24 mx-auto my-4">
                          <AvatarImage src={teams[2].logo || "/placeholder.svg"} alt={teams[2].teamName} />
                          <AvatarFallback className="text-2xl">{teams[2].teamName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold mb-1">{teams[2].teamName}</h3>
                        <p className="text-gray-600 mb-3">{teams[2].slogan}</p>
                        {typeof teams[2].finalScore === 'number' && (
                          <div className="text-lg font-semibold text-orange-700">
                            Final: {teams[2].finalScore}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            {teams[2].memberCount} thành viên
                          </Badge>
                          {typeof teams[2].averageScore === 'number' && (
                            <Badge variant="secondary" className="text-sm">
                              Điểm TB: {teams[2].averageScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
