"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Star, FileText, Presentation, Heart, ArrowLeft, Loader2, Medal, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type TeamCriterionKey = "creativity" | "feasibility" | "ai_effectiveness" | "presentation" | "social_impact"
type MemberCriterionKey = "skills" | "inspiration"

type TeamUI = {
  id: number
  teamName: string
  slogan: string
  logo: string | null
  memberCount: number
  leader: {
    name: string
    studentId: string
    year: string
    class: string
    email: string
    phone?: string
    avatar?: string | null
    code?: string
  }
  members: Array<{
    name: string
    studentId: string
    year: string
    class: string
    email: string
    avatar?: string | null
    code?: string
  }>
  teamScores: Record<TeamCriterionKey, number | null>
  memberScores: Array<Record<MemberCriterionKey, number | null>>
  api: {
    code_leader?: string
    code_member1?: string
    code_member2?: string
    code_member3?: string
    code_member4?: string
  }
  submissions?: {
    surveyLink?: string | null
    slideLink?: string | null
    videoLink?: string | null
    sourceCodeLink?: string | null
  }
  averageScore?: number
  judgeCount?: number
  finalScore?: number
}

const teamCriteria: Array<{ key: TeamCriterionKey; label: string; maxScore: number; icon: any }> = [
  { key: "creativity", label: "Tính sáng tạo", maxScore: 25, icon: Star },
  { key: "feasibility", label: "Tính khả thi", maxScore: 25, icon: Trophy },
  { key: "ai_effectiveness", label: "Hiệu quả ứng dụng AI", maxScore: 20, icon: FileText },
  { key: "presentation", label: "Khả năng thuyết trình", maxScore: 15, icon: Presentation },
  { key: "social_impact", label: "Tác động xã hội", maxScore: 15, icon: Heart },
]

const memberCriteria: Array<{ key: MemberCriterionKey; label: string; maxScore: number }> = [
  { key: "skills", label: "Kỹ năng cá nhân và tinh thần học hỏi", maxScore: 50 },
  { key: "inspiration", label: "Truyền cảm hứng và chia sẻ kiến thức AI", maxScore: 50 },
]

export default function JudgesFinalPage() {
  const [teams, setTeams] = useState<TeamUI[]>([])
  const [selectedTeam, setSelectedTeam] = useState(0)
  const [comments, setComments] = useState("")
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [teamScoreIds, setTeamScoreIds] = useState<Record<number, string>>({})
  const [requireIdForTeam, setRequireIdForTeam] = useState<number | null>(null)
  const [judgeScores, setJudgeScores] = useState<Record<number, any>>({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const router = useRouter()

  const judgeProfile = useMemo(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem("judge_profile")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && !judgeProfile) {
      router.replace("/judges/login")
    }
  }, [judgeProfile, router])

  // Lấy Top 3 đội từ final-scores và map thông tin đội
  useEffect(() => {
    const fetchTopTeams = async () => {
      setLoadingTeams(true)
      setTeamsError(null)
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

        const mapped: TeamUI[] = teamIds
          .map((id) => {
            const rankRow = top3.find((r: any) => r.team_id === id)
            const t = teamsMap.get(id)
            if (!t) return null
          const members: TeamUI["members"] = []
          if (t.name_member1) members.push({
            name: t.name_member1,
            studentId: t.code_member1 || "",
            year: t.khoa_member1 || "",
            class: t.class_member1 || "",
            email: t.email_ptit_member1 || "",
            avatar: ensureStaticUrl(t.url_member1) || null,
            code: t.code_member1,
          })
          if (t.name_member2) members.push({
            name: t.name_member2,
            studentId: t.code_member2 || "",
            year: t.khoa_member2 || "",
            class: t.class_member2 || "",
            email: t.email_ptit_member2 || "",
            avatar: ensureStaticUrl(t.url_member2) || null,
            code: t.code_member2,
          })
          if (t.name_member3) members.push({
            name: t.name_member3,
            studentId: t.code_member3 || "",
            year: t.khoa_member3 || "",
            class: t.class_member3 || "",
            email: t.email_ptit_member3 || "",
            avatar: ensureStaticUrl(t.url_member3) || null,
            code: t.code_member3,
          })
          if (t.name_member4) members.push({
            name: t.name_member4,
            studentId: t.code_member4 || "",
            year: t.khoa_member4 || "",
            class: t.class_member4 || "",
            email: t.email_ptit_member4 || "",
            avatar: ensureStaticUrl(t.url_member4) || null,
            code: t.code_member4,
          })

          return {
            id: t.id,
            teamName: t.team_name,
            slogan: t.slogan,
            logo: ensureStaticUrl(t.logo_url),
            memberCount: t.member_count ?? members.length + 1,
            leader: {
              name: t.name_leader || "Leader",
              studentId: t.code_leader || "",
              year: t.khoa_leader || "",
              class: t.class_leader || "",
              email: t.email_ptit_leader || "",
              phone: t.phone_leader || "",
              avatar: ensureStaticUrl(t.url_leader) || null,
              code: t.code_leader,
            },
            members,
            teamScores: { creativity: null, feasibility: null, ai_effectiveness: null, presentation: null, social_impact: null },
            memberScores: new Array(Math.max(1, members.length + 1))
              .fill(0)
              .map(() => ({ skills: null, inspiration: null })),
            api: {
              code_leader: t.code_leader,
              code_member1: t.code_member1,
              code_member2: t.code_member2,
              code_member3: t.code_member3,
              code_member4: t.code_member4,
            },
            submissions: {
              surveyLink: t.survey_link || null,
              slideLink: t.slide_link || null,
              videoLink: t.video_link || null,
              sourceCodeLink: t.source_code_link || null,
            },
            finalScore: rankRow?.final_score ? Math.round(rankRow.final_score * 10000) / 10000 : undefined,
            averageScore: rankRow?.average_score ? Math.round(rankRow.average_score) : undefined,
          } as TeamUI
          })
          .filter(Boolean) as TeamUI[]

        setTeams(mapped)
        setSelectedTeam(0)
      } catch (err: any) {
        setTeamsError(err.message || "Lỗi tải danh sách đội")
      } finally {
        setLoadingTeams(false)
      }
    }
    fetchTopTeams()
  }, [])

  const currentTeam = teams[selectedTeam]

  const updateTeamScore = (teamIndex: number, criterion: TeamCriterionKey, score: number | null) => {
    const updated = [...teams]
    if (score === null || Number.isNaN(score)) {
      updated[teamIndex].teamScores[criterion] = null
    } else {
      const maxScore = getMaxScore(criterion)
      updated[teamIndex].teamScores[criterion] = Math.max(0, Math.min(score, maxScore))
    }
    setTeams(updated)
  }

  const getMaxScore = (criterion: TeamCriterionKey) => {
    const criteria = teamCriteria.find((c) => c.key === criterion)
    return criteria ? criteria.maxScore : 0
  }

  const calculateTeamTotal = (teamScores: Record<TeamCriterionKey, number | null>) => {
    return (Object.values(teamScores) as Array<number | null>).reduce(
      (sum: number, score: number | null) => sum + (typeof score === "number" ? score : 0),
      0,
    )
  }

  const handleSaveFinalScore = async () => {
    if (!currentTeam) return
    setSaveError(null)
    setSaving(true)
    try {
      const payload = {
        team_id: currentTeam.id,
        judge_id: judgeProfile?.id || 0,
        creativity: currentTeam.teamScores.creativity ?? 0,
        feasibility: currentTeam.teamScores.feasibility ?? 0,
        ai_effectiveness: currentTeam.teamScores.ai_effectiveness ?? 0,
        presentation: currentTeam.teamScores.presentation ?? 0,
        social_impact: currentTeam.teamScores.social_impact ?? 0,
        total_score: calculateTeamTotal(currentTeam.teamScores),
        comment: comments,
      }
      const base = "https://live-code-be.ript.vn/api/v1/scores"
      const currentScoreId = teamScoreIds[currentTeam.id]
      const url = currentScoreId ? `${base}/${encodeURIComponent(currentScoreId)}` : base
      const method = currentScoreId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        let errorText = `${method === "POST" ? "Lưu" : "Cập nhật"} điểm thất bại (${res.status})`
        try {
          const errBody = await res.json()
          if (errBody?.detail) errorText = String(errBody.detail)
        } catch {}
        throw new Error(errorText)
      }
      
      const body = await res.json().catch(() => null)
      const createdId = body?.data?.id
      if (method === "POST" && createdId) {
        setTeamScoreIds((prev) => ({ ...prev, [currentTeam.id]: String(createdId) }))
      }
      
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "Không thể lưu điểm")
    } finally {
      setSaving(false)
    }
  }

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
                AIC 2025 - Vòng Chung Kết (Trang kết quả)
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-4">
            Vòng Chung Kết - Top 3 Đội Xuất Sắc
          </h1>
          <p className="text-lg text-gray-600">AIC 2025 - Chấm điểm vòng chung kết</p>
        </div>

        {/* Navigation cho 2 vòng thi */}
        <div className="mb-8"></div>

        {loadingTeams && (
          <div className="flex items-center justify-center py-16 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải top 3 đội...
          </div>
        )}
        {teamsError && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{teamsError}</div>
        )}

        {!loadingTeams && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-yellow-500" />
                Top 3 Đội Xuất Sắc Nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map((team, index) => {
                  const rank = index + 1 // Vì teams đã được sắp xếp theo rank từ API
                  return (
                  <Card
                    key={team.id}
                    className={`relative cursor-pointer transition-all hover:shadow-lg ${
                      selectedTeam === index ? "ring-2 ring-purple-500 bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedTeam(index)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center mb-3">
                        <div className="flex justify-center mb-2">
                          {rank === 1 && <Medal className="h-8 w-8 text-yellow-500" />}
                          {rank === 2 && <Medal className="h-8 w-8 text-gray-400" />}
                          {rank === 3 && <Medal className="h-8 w-8 text-orange-600" />}
                        </div>
                        <Badge variant={rank === 1 ? "default" : "secondary"} className="text-sm">
                          Hạng {rank}
                        </Badge>
                        {typeof team.finalScore === 'number' && (
                          <div className="mt-1 text-xs text-gray-600">Final: {team.finalScore}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={team.logo || "/placeholder.svg"} alt={team.teamName} />
                          <AvatarFallback>{team.teamName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{team.teamName}</h3>
                          <p className="text-sm text-gray-600">{team.slogan}</p>
                          <div className="flex gap-1 mt-1">
                            {typeof team.averageScore === 'number' && (
                              <Badge variant="outline" className="text-xs">Điểm TB: {team.averageScore}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {rank === 1 && (
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded">
                          Quán quân
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {currentTeam && !loadingTeams && (
          <Tabs defaultValue="team-info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="team-info">Thông Tin Đội</TabsTrigger>
              <TabsTrigger value="team-scoring">Chấm Điểm Vòng Chung Kết</TabsTrigger>
            </TabsList>

            <TabsContent value="team-info">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Đội Thi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={currentTeam.logo || "/placeholder.svg"} alt={currentTeam.teamName} />
                        <AvatarFallback>{currentTeam.teamName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{currentTeam.teamName}</h3>
                        <p className="text-gray-600">{currentTeam.slogan}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{currentTeam.memberCount} thành viên</Badge>
                          <Badge className="bg-purple-100 text-purple-800">Điểm TB: {currentTeam.averageScore}/100</Badge>
                          <Badge variant="secondary">{currentTeam.judgeCount} giám khảo</Badge>
                        </div>
                      </div>
                    </div>

                    {currentTeam.submissions && (
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold mb-2">Bài nộp</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {currentTeam.submissions.surveyLink && (
                            <a className="text-purple-600 underline" href={currentTeam.submissions.surveyLink} target="_blank" rel="noreferrer">
                              Phiếu khảo sát
                            </a>
                          )}
                          {currentTeam.submissions.slideLink && (
                            <a className="text-purple-600 underline" href={currentTeam.submissions.slideLink} target="_blank" rel="noreferrer">
                              Slide trình bày
                            </a>
                          )}
                          {currentTeam.submissions.videoLink && (
                            <a className="text-purple-600 underline" href={currentTeam.submissions.videoLink} target="_blank" rel="noreferrer">
                              Video demo
                            </a>
                          )}
                          {currentTeam.submissions.sourceCodeLink && (
                            <a className="text-purple-600 underline" href={currentTeam.submissions.sourceCodeLink} target="_blank" rel="noreferrer">
                              Source code
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thông Tin Leader</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={currentTeam.leader.avatar || "/placeholder.svg"} alt={currentTeam.leader.name} />
                        <AvatarFallback>{currentTeam.leader.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{currentTeam.leader.name}</h4>
                        <Badge variant="secondary">Leader</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>MSSV:</strong> {currentTeam.leader.studentId}</div>
                      <div><strong>Khóa:</strong> {currentTeam.leader.year}</div>
                      <div><strong>Lớp:</strong> {currentTeam.leader.class}</div>
                      <div><strong>Email:</strong> {currentTeam.leader.email}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Thành Viên Đội Thi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTeam.members.map((member, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                              <AvatarFallback>{member.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="font-semibold">{member.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                Thành viên {index + 2}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div><strong>MSSV:</strong> {member.studentId}</div>
                            <div><strong>Khóa:</strong> {member.year}</div>
                            <div><strong>Lớp:</strong> {member.class}</div>
                            <div><strong>Email:</strong> {member.email}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team-scoring">
              <Card>
                <CardHeader>
                  <CardTitle>Chấm Điểm Vòng Chung Kết: {currentTeam.teamName}</CardTitle>
                  <p className="text-sm text-gray-600">Chấm điểm cho đội xuất sắc vào vòng chung kết</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-center text-purple-800 font-medium">
                      🏆 Đây là một trong 3 đội xuất sắc nhất đã vào vòng chung kết!
                    </p>
                  </div>
                  
                  {/* Các tiêu chí chấm điểm tương tự như vòng ý tưởng */}
                  {teamCriteria.map((criterion) => {
                    const IconComponent = criterion.icon
                    return (
                      <div key={criterion.key} className="flex items-center gap-4 p-4 border rounded-lg">
                        <IconComponent className="h-6 w-6 text-purple-600" />
                        <div className="flex-1">
                          <Label className="text-base font-medium">{criterion.label}</Label>
                          <p className="text-sm text-gray-600">Tối đa {criterion.maxScore} điểm</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={criterion.maxScore}
                            value={
                              currentTeam.teamScores[criterion.key] === null
                                ? ""
                                : String(currentTeam.teamScores[criterion.key] as number)
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value
                              if (inputValue === "") {
                                updateTeamScore(selectedTeam, criterion.key, null)
                                return
                              }
                              const value = Number.parseInt(inputValue) || 0
                              // Kiểm tra không vượt quá điểm tối đa
                              if (value > criterion.maxScore) {
                                // Nếu vượt quá, set về điểm tối đa
                                updateTeamScore(selectedTeam, criterion.key, criterion.maxScore)
                                e.target.value = String(criterion.maxScore)
                              } else if (value < 0) {
                                // Nếu âm, set về 0
                                updateTeamScore(selectedTeam, criterion.key, 0)
                                e.target.value = "0"
                              } else {
                                updateTeamScore(selectedTeam, criterion.key, value)
                              }
                            }}
                            className="w-20 text-center"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">/ {criterion.maxScore}</span>
                        </div>
                      </div>
                    )
                  })}

                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng điểm vòng chung kết:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {calculateTeamTotal(currentTeam.teamScores)} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="final-comments">Nhận xét vòng chung kết</Label>
                    <Textarea
                      id="final-comments"
                      placeholder="Nhận xét cho đội thi trong vòng chung kết..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {saveError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{saveError}</div>
                  )}
                  
                  {showSuccessMessage && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
                      <CheckCircle className="h-4 w-4" />
                      Đã hoàn thành chấm điểm vòng chung kết cho đội {currentTeam.teamName}!
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      className="w-full sm:w-56 bg-purple-600 hover:bg-purple-700" 
                      disabled={saving}
                      onClick={handleSaveFinalScore}
                    >
                      {saving ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin"/>
                          Đang xác nhận...
                        </span>
                      ) : (
                        "Xác nhận điểm vòng chung kết"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            
          </Tabs>
        )}
      </div>
    </div>
  )
}
