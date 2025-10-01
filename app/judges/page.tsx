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
import { Users, Trophy, Star, FileText, Presentation, Heart, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
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

export default function JudgesPage() {
  const [teams, setTeams] = useState<TeamUI[]>([])
  const [selectedTeam, setSelectedTeam] = useState(0)
  const [comments, setComments] = useState("")
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [teamsError, setTeamsError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [teamScoreIds, setTeamScoreIds] = useState<Record<number, string>>({})
  const [requireIdForTeam, setRequireIdForTeam] = useState<number | null>(null)
  const [judgeScores, setJudgeScores] = useState<Record<number, any>>({}) // team_id -> score object
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
    // Bảo vệ route: chưa đăng nhập thì chuyển về trang login
    if (typeof window !== "undefined" && !judgeProfile) {
      router.replace("/judges/login")
    }
  }, [judgeProfile, router])

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true)
      setTeamsError(null)
      try {
        const url =
          "https://live-code-be.ript.vn/api/v1/teams?limit=10&offset=0"
        const res = await fetch(url, { headers: { accept: "application/json" }, method: "GET" })
        if (!res.ok) throw new Error(`Không thể tải danh sách đội (${res.status})`)
        const body = await res.json()
        if (!body?.success || !Array.isArray(body?.data)) throw new Error("Dữ liệu không hợp lệ")

        const STATIC_BASE = "https://live-code-be.ript.vn/static/"
        const ensureStaticUrl = (path?: string | null) => {
          if (!path) return null
          if (path.startsWith("http://") || path.startsWith("https://")) return path
          return STATIC_BASE + path.replace(/^\/+/, "")
        }

        const mapped: TeamUI[] = body.data.map((t: any) => {
          const members: TeamUI["members"] = []
          if (t.name_member1)
            members.push({
              name: t.name_member1,
              studentId: t.code_member1 || "",
              year: t.khoa_member1 || "",
              class: t.class_member1 || "",
              email: t.email_ptit_member1 || "",
              avatar: ensureStaticUrl(t.url_member1) || null,
              code: t.code_member1,
            })
          if (t.name_member2)
            members.push({
              name: t.name_member2,
              studentId: t.code_member2 || "",
              year: t.khoa_member2 || "",
              class: t.class_member2 || "",
              email: t.email_ptit_member2 || "",
              avatar: ensureStaticUrl(t.url_member2) || null,
              code: t.code_member2,
            })
          if (t.name_member3)
            members.push({
              name: t.name_member3,
              studentId: t.code_member3 || "",
              year: t.khoa_member3 || "",
              class: t.class_member3 || "",
              email: t.email_ptit_member3 || "",
              avatar: ensureStaticUrl(t.url_member3) || null,
              code: t.code_member3,
            })
          if (t.name_member4)
            members.push({
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
          } as TeamUI
        })

        setTeams(mapped)
        setSelectedTeam(0)
      } catch (err: any) {
        setTeamsError(err.message || "Lỗi tải danh sách đội")
      } finally {
        setLoadingTeams(false)
      }
    }
    fetchTeams()
  }, [])

  // Tải các điểm đã chấm của giám khảo hiện tại
  useEffect(() => {
    const fetchJudgeScores = async () => {
      if (!judgeProfile?.id) return
      try {
        const url = `https://live-code-be.ript.vn/api/v1/scores/judge/${encodeURIComponent(
          judgeProfile.id,
        )}`
        const res = await fetch(url, { headers: { accept: "application/json" } })
        if (!res.ok) return
        const body = await res.json()
        if (!body?.success || !Array.isArray(body?.data)) return
        const map: Record<number, any> = {}
        const idsMap: Record<number, string> = {}
        body.data.forEach((row: any) => {
          if (row?.team_id) {
            map[row.team_id] = row
            if (row?.id) idsMap[row.team_id] = String(row.id)
          }
        })
        setJudgeScores(map)
        if (Object.keys(idsMap).length) setTeamScoreIds((prev) => ({ ...prev, ...idsMap }))
      } catch {}
    }
    fetchJudgeScores()
  }, [judgeProfile?.id])

  // Khi đổi team được chọn hoặc khi tải được điểm, tự động điền lại dữ liệu vào form
  useEffect(() => {
    if (!teams.length) return
    const team = teams[selectedTeam]
    if (!team) return
    const scored = judgeScores[team.id]
    if (!scored) return
    // Prefill điểm đội và comment
    setTeams((prev) => {
      const next = [...prev]
      const t = { ...next[selectedTeam] }
      t.teamScores = {
        creativity: scored.creativity ?? t.teamScores.creativity,
        feasibility: scored.feasibility ?? t.teamScores.feasibility,
        ai_effectiveness: scored.ai_effectiveness ?? t.teamScores.ai_effectiveness,
        presentation: scored.presentation ?? t.teamScores.presentation,
        social_impact: scored.social_impact ?? t.teamScores.social_impact,
      }
      // Prefill điểm cá nhân nếu có trong dữ liệu trả về
      const ms = [...t.memberScores]
      if (ms[0]) {
        ms[0] = {
          skills: (scored.skills_learning_leader ?? ms[0].skills) as number | null,
          inspiration: (scored.inspiration_leader ?? ms[0].inspiration) as number | null,
        }
      }
      if (ms[1]) {
        ms[1] = {
          skills: (scored.skills_learning_member1 ?? ms[1].skills) as number | null,
          inspiration: (scored.inspiration_member1 ?? ms[1].inspiration) as number | null,
        }
      }
      if (ms[2]) {
        ms[2] = {
          skills: (scored.skills_learning_member2 ?? ms[2].skills) as number | null,
          inspiration: (scored.inspiration_member2 ?? ms[2].inspiration) as number | null,
        }
      }
      if (ms[3]) {
        ms[3] = {
          skills: (scored.skills_learning_member3 ?? ms[3].skills) as number | null,
          inspiration: (scored.inspiration_member3 ?? ms[3].inspiration) as number | null,
        }
      }
      if (ms[4]) {
        ms[4] = { ...ms[4] }
      }
      t.memberScores = ms
      next[selectedTeam] = t
      return next
    })
    setComments(scored.comment ?? "")
  }, [selectedTeam, judgeScores, teams.length])

  const updateTeamScore = (teamIndex: number, criterion: TeamCriterionKey, score: number | null) => {
    const updated = [...teams]
    if (score === null || Number.isNaN(score)) {
      updated[teamIndex].teamScores[criterion] = null
    } else {
      updated[teamIndex].teamScores[criterion] = Math.max(0, Math.min(score, 100))
    }
    setTeams(updated)
  }

  const updateMemberScore = (
    teamIndex: number,
    memberIndex: number,
    criterion: MemberCriterionKey,
    score: number | null,
  ) => {
    const updated = [...teams]
    if (score === null || Number.isNaN(score)) {
      updated[teamIndex].memberScores[memberIndex][criterion] = null
    } else {
      updated[teamIndex].memberScores[memberIndex][criterion] = Math.max(0, Math.min(score, 50))
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

  const calculateMemberTotal = (memberScores: Record<MemberCriterionKey, number | null>) => {
    return (memberScores.skills ?? 0) + (memberScores.inspiration ?? 0)
  }

  const currentTeam = teams[selectedTeam]

  const handleSaveScore = async (method: "POST" | "PUT") => {
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
      const url = method === "PUT" ? `${base}/${encodeURIComponent(currentScoreId)}` : base
      const res = await fetch(url, {
        method,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // Nếu đã tồn tại score cho team & judge, cần PUT thay vì POST
        let errorText = `${method === "POST" ? "Lưu" : "Cập nhật"} điểm thất bại (${res.status})`
        try {
          const errBody = await res.json()
          if (
            method === "POST" &&
            (errBody?.detail === "Score for this team and judge already exists" ||
              String(errBody?.detail || "").toLowerCase().includes("already exists"))
          ) {
            // Cố gắng PUT nếu đã biết ID; nếu chưa biết, yêu cầu người dùng cung cấp ID
            const knownId = teamScoreIds[currentTeam.id]
            if (knownId) {
              // gọi lại với PUT
              await handleSaveScore("PUT")
              return
            } else {
              setRequireIdForTeam(currentTeam.id)
              errorText =
                "Điểm cho team và giám khảo đã tồn tại. Vui lòng nhập Score ID để cập nhật (PUT)."
            }
          } else if (errBody?.message) {
            errorText = String(errBody.message)
          }
        } catch {}
        throw new Error(errorText)
      }
      const body = await res.json().catch(() => null)
      const createdId = body?.data?.id
      if (method === "POST" && createdId) {
        setTeamScoreIds((prev) => ({ ...prev, [currentTeam.id]: String(createdId) }))
        setRequireIdForTeam(null)
      }
      
      // Hiển thị thông báo thành công
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "Không thể lưu điểm")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAuto = async () => {
    // Nếu team hiện tại đã có scoreId thì PUT, ngược lại POST
    const hasId = currentTeam ? Boolean(teamScoreIds[currentTeam.id]) : false
    return handleSaveScore(hasId ? "PUT" : "POST")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
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
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                AIC 2025 - Giám Khảo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Về Trang Chủ
                </Link>
              </Button>
              <Button asChild className="flex items-center gap-2">
                <Link href="/results">Kết quả chung cuộc</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Chấm Điểm Vòng Chung Kết
          </h1>
          <p className="text-lg text-gray-600">AIC 2025 - Top 3 đội xuất sắc nhất</p>
        </div>

        {loadingTeams && (
          <div className="flex items-center justify-center py-16 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách đội...
          </div>
        )}
        {teamsError && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{teamsError}</div>
        )}

        {!loadingTeams && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Chọn Đội Thi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team, index) => (
                  <Card
                    key={team.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTeam === index ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedTeam(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={team.logo || "/placeholder.svg"} alt={team.teamName} />
                          <AvatarFallback>{team.teamName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{team.teamName}</h3>
                          <p className="text-sm text-gray-600">{team.slogan}</p>
                          <Badge variant="secondary" className="mt-1">
                            {team.memberCount} thành viên
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentTeam && !loadingTeams && (
          <Tabs defaultValue="team-info" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="team-info">Thông Tin Đội</TabsTrigger>
              <TabsTrigger value="team-scoring">Chấm Điểm Đội</TabsTrigger>
              <TabsTrigger value="member-scoring">Chấm Điểm Cá Nhân</TabsTrigger>
              <TabsTrigger value="summary">Tổng Kết</TabsTrigger>
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
                        <Badge variant="outline">{currentTeam.memberCount} thành viên</Badge>
                      </div>
                    </div>

                    {/* Links bai nop */}
                    {currentTeam.submissions && (
                      <div className="pt-2 border-t">
                        <h4 className="font-semibold mb-2">Bài nộp</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {currentTeam.submissions.surveyLink && (
                            <a className="text-blue-600 underline" href={currentTeam.submissions.surveyLink} target="_blank" rel="noreferrer">
                              Phiếu khảo sát
                            </a>
                          )}
                          {currentTeam.submissions.slideLink && (
                            <a className="text-blue-600 underline" href={currentTeam.submissions.slideLink} target="_blank" rel="noreferrer">
                              Slide trình bày
                            </a>
                          )}
                          {currentTeam.submissions.videoLink && (
                            <a className="text-blue-600 underline" href={currentTeam.submissions.videoLink} target="_blank" rel="noreferrer">
                              Video demo
                            </a>
                          )}
                          {currentTeam.submissions.sourceCodeLink && (
                            <a className="text-blue-600 underline" href={currentTeam.submissions.sourceCodeLink} target="_blank" rel="noreferrer">
                              Source code
                            </a>
                          )}
                          {!currentTeam.submissions.surveyLink && !currentTeam.submissions.slideLink && !currentTeam.submissions.videoLink && !currentTeam.submissions.sourceCodeLink && (
                            <span className="text-gray-500">Chưa có liên kết bài nộp</span>
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
                      <div>
                        <strong>MSSV:</strong> {currentTeam.leader.studentId}
                      </div>
                      <div>
                        <strong>Khóa:</strong> {currentTeam.leader.year}
                      </div>
                      <div>
                        <strong>Lớp:</strong> {currentTeam.leader.class}
                      </div>
                      <div>
                        <strong>Email:</strong> {currentTeam.leader.email}
                      </div>
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
                      <Card key={index} className="border-l-4 border-l-blue-500">
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
                            <div>
                              <strong>MSSV:</strong> {member.studentId}
                            </div>
                            <div>
                              <strong>Khóa:</strong> {member.year}
                            </div>
                            <div>
                              <strong>Lớp:</strong> {member.class}
                            </div>
                            <div>
                              <strong>Email:</strong> {member.email}
                            </div>
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
                  <CardTitle>Chấm Điểm Đội Thi: {currentTeam.teamName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {teamCriteria.map((criterion) => {
                    const IconComponent = criterion.icon
                    return (
                      <div key={criterion.key} className="flex items-center gap-4 p-4 border rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
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
                          />
                          <span className="text-sm text-gray-500">/ {criterion.maxScore}</span>
                        </div>
                      </div>
                    )
                  })}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng điểm đội:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {calculateTeamTotal(currentTeam.teamScores)} / 100
                      </span>
                    </div>
                  </div>

                  {/* Xác nhận điểm đội */}
                  {saveError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{saveError}</div>
                  )}
                  
                  {showSuccessMessage && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
                      <CheckCircle className="h-4 w-4" />
                      Đã hoàn thành chấm điểm cho đội {currentTeam.teamName}!
                    </div>
                  )}
                  {requireIdForTeam === currentTeam.id && !teamScoreIds[currentTeam.id] && (
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                      <div className="flex-1">
                        <Label htmlFor="scoreId-existing">Score ID hiện có</Label>
                        <Input
                          id="scoreId-existing"
                          placeholder="Nhập ID điểm tồn tại để cập nhật"
                          onChange={(e) =>
                            setTeamScoreIds((prev) => ({ ...prev, [currentTeam.id]: e.target.value }))
                          }
                        />
                      </div>
                      <Button
                        className="sm:w-56"
                        variant="outline"
                        disabled={saving || !teamScoreIds[currentTeam.id]}
                        onClick={() => handleSaveScore("PUT")}
                      >
                        {saving ? (
                          <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Đang cập nhật...</span>
                        ) : (
                          "Cập nhật (PUT)"
                        )}
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-end mt-3">
                    <Button className="w-full sm:w-56" disabled={saving} onClick={handleSaveAuto}>
                      {saving ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Đang xác nhận...</span>
                      ) : (
                        (currentTeam && teamScoreIds[currentTeam.id] ? "Cập nhật điểm đội" : "Xác nhận điểm đội")
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="member-scoring">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentTeam.leader.avatar || "/placeholder.svg"} alt={currentTeam.leader.name} />
                        <AvatarFallback>{currentTeam.leader.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {currentTeam.leader.name} (Leader)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {memberCriteria.map((criterion) => (
                      <div key={criterion.key} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label className="text-base">{criterion.label}</Label>
                          <p className="text-sm text-gray-600">Tối đa {criterion.maxScore} điểm</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={criterion.maxScore}
                            value={
                              currentTeam.memberScores[0][criterion.key] === null
                                ? ""
                                : String(currentTeam.memberScores[0][criterion.key] as number)
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value
                              if (inputValue === "") {
                                updateMemberScore(selectedTeam, 0, criterion.key, null)
                                return
                              }
                              const value = Number.parseInt(inputValue) || 0
                              // Kiểm tra không vượt quá điểm tối đa (50 cho member criteria)
                              if (value > criterion.maxScore) {
                                updateMemberScore(selectedTeam, 0, criterion.key, criterion.maxScore)
                                e.target.value = String(criterion.maxScore)
                              } else if (value < 0) {
                                updateMemberScore(selectedTeam, 0, criterion.key, 0)
                                e.target.value = "0"
                              } else {
                                updateMemberScore(selectedTeam, 0, criterion.key, value)
                              }
                            }}
                            className="w-20 text-center"
                          />
                          <span className="text-sm text-gray-500">/ {criterion.maxScore}</span>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Tổng điểm cá nhân:</span>
                        <span className="text-xl font-bold text-green-600">
                          {calculateMemberTotal(currentTeam.memberScores[0])} / 100
                        </span>
                      </div>
                    </div>

                    {/* Xác nhận điểm Leader */}
                    <div className="flex justify-end">
                      <Button disabled={saving} onClick={handleSaveAuto}>
                        {saving ? (
                          <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Đang xác nhận...</span>
                        ) : (
                          (currentTeam && teamScoreIds[currentTeam.id] ? "Cập nhật điểm Leader" : "Xác nhận điểm Leader")
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {currentTeam.members.map((member, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name.split(" ").pop()?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {memberCriteria.map((criterion) => (
                        <div key={criterion.key} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <Label className="text-base">{criterion.label}</Label>
                            <p className="text-sm text-gray-600">Tối đa {criterion.maxScore} điểm</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={criterion.maxScore}
                              value={
                                currentTeam.memberScores[index + 1][criterion.key] === null
                                  ? ""
                                  : String(currentTeam.memberScores[index + 1][criterion.key] as number)
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value
                                if (inputValue === "") {
                                  updateMemberScore(selectedTeam, index + 1, criterion.key, null)
                                  return
                                }
                                const value = Number.parseInt(inputValue) || 0
                                // Kiểm tra không vượt quá điểm tối đa (50 cho member criteria)
                                if (value > criterion.maxScore) {
                                  updateMemberScore(selectedTeam, index + 1, criterion.key, criterion.maxScore)
                                  e.target.value = String(criterion.maxScore)
                                } else if (value < 0) {
                                  updateMemberScore(selectedTeam, index + 1, criterion.key, 0)
                                  e.target.value = "0"
                                } else {
                                  updateMemberScore(selectedTeam, index + 1, criterion.key, value)
                                }
                              }}
                              className="w-20 text-center"
                            />
                            <span className="text-sm text-gray-500">/ {criterion.maxScore}</span>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Tổng điểm cá nhân:</span>
                          <span className="text-xl font-bold text-green-600">
                            {calculateMemberTotal(currentTeam.memberScores[index + 1])} / 100
                          </span>
                        </div>
                      </div>

                      {/* Xác nhận điểm thành viên */}
                      <div className="flex justify-end">
                        <Button disabled={saving} onClick={handleSaveAuto}>
                          {saving ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Đang xác nhận...</span>
                          ) : (
                            (currentTeam && teamScoreIds[currentTeam.id] ? "Cập nhật điểm thành viên" : "Xác nhận điểm thành viên")
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Các Đội Đã Chấm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(judgeScores).length === 0 && (
                      <div className="text-sm text-gray-600">Chưa có đội nào được bạn chấm điểm.</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams
                        .filter((t) => Boolean(judgeScores[t.id]))
                        .map((t) => {
                          const s = judgeScores[t.id]
                          const total =
                            (s?.creativity ?? 0) +
                            (s?.feasibility ?? 0) +
                            (s?.ai_effectiveness ?? 0) +
                            (s?.presentation ?? 0) +
                            (s?.social_impact ?? 0)
                          return (
                            <Card key={t.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="font-semibold">{t.teamName}</div>
                                  <Badge variant="secondary">Tổng: {total} / 100</Badge>
                                </div>
                                <div className="text-sm text-gray-700 space-y-1">
                                  <div>• Sáng tạo: {s?.creativity ?? 0}</div>
                                  <div>• Khả thi: {s?.feasibility ?? 0}</div>
                                  <div>• Hiệu quả AI: {s?.ai_effectiveness ?? 0}</div>
                                  <div>• Thuyết trình: {s?.presentation ?? 0}</div>
                                  <div>• Tác động XH: {s?.social_impact ?? 0}</div>
                                </div>
                                <div className="mt-3 border-t pt-2">
                                  <div className="font-medium mb-2">Điểm cá nhân</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                                    <div>
                                      Leader: {(s?.skills_learning_leader ?? 0) + (s?.inspiration_leader ?? 0)} / 100
                                      <span className="text-gray-500"> (Kỹ năng: {s?.skills_learning_leader ?? 0}, Truyền cảm hứng: {s?.inspiration_leader ?? 0})</span>
                                    </div>
                                    <div>
                                      Thành viên 1: {(s?.skills_learning_member1 ?? 0) + (s?.inspiration_member1 ?? 0)} / 100
                                      <span className="text-gray-500"> (Kỹ năng: {s?.skills_learning_member1 ?? 0}, Truyền cảm hứng: {s?.inspiration_member1 ?? 0})</span>
                                    </div>
                                    <div>
                                      Thành viên 2: {(s?.skills_learning_member2 ?? 0) + (s?.inspiration_member2 ?? 0)} / 100
                                      <span className="text-gray-500"> (Kỹ năng: {s?.skills_learning_member2 ?? 0}, Truyền cảm hứng: {s?.inspiration_member2 ?? 0})</span>
                                    </div>
                                    <div>
                                      Thành viên 3: {(s?.skills_learning_member3 ?? 0) + (s?.inspiration_member3 ?? 0)} / 100
                                      <span className="text-gray-500"> (Kỹ năng: {s?.skills_learning_member3 ?? 0}, Truyền cảm hứng: {s?.inspiration_member3 ?? 0})</span>
                                    </div>
                                    {/** Thành viên 4 chỉ có mã code_member4, không có điểm inspiration/skills trong output mẫu? Vẫn hiển thị nếu có dữ liệu khác 0 */}
                                    <div>
                                      Thành viên 4: {(s?.skills_learning_member4 ?? 0) + (s?.inspiration_member4 ?? 0)} / 100
                                      <span className="text-gray-500"> (Kỹ năng: {s?.skills_learning_member4 ?? 0}, Truyền cảm hứng: {s?.inspiration_member4 ?? 0})</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}


