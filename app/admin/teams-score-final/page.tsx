"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Loader2, CheckCircle, AlertCircle, Plus } from "lucide-react"
import Image from "next/image"

type TeamsScoreFinal = {
  id: number
  team_id: number
  judge_id: number
  creativity: number
  feasibility: number
  ai_effectiveness: number
  presentation: number
  social_impact: number
  total_score: number
  final_score: number
  vote_total: number
  comment: string
  created_at: string
  updated_at: string
}

type Team = {
  id: number
  team_name: string
  slogan: string
  logo_url: string | null
}

type Judge = {
  id: number
  username: string
  full_name: string
}

export default function AdminTeamsScoreFinalPage() {
  const [scores, setScores] = useState<TeamsScoreFinal[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [judges, setJudges] = useState<Judge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [editingScore, setEditingScore] = useState<TeamsScoreFinal | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    team_id: "",
    judge_id: "",
    creativity: "",
    feasibility: "",
    ai_effectiveness: "",
    presentation: "",
    social_impact: "",
    vote_total: "",
    comment: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch teams
      const teamsRes = await fetch("https://live-code-be.ript.vn/api/v1/teams?limit=100&offset=0", {
        headers: { accept: "application/json" }
      })
      if (teamsRes.ok) {
        const teamsBody = await teamsRes.json()
        if (teamsBody?.success) setTeams(teamsBody.data || [])
      }

      // Fetch judges
      const judgesRes = await fetch("https://live-code-be.ript.vn/api/v1/judges/judges", {
        headers: { accept: "application/json" }
      })
      if (judgesRes.ok) {
        const judgesBody = await judgesRes.json()
        if (judgesBody?.success) setJudges(judgesBody.data || [])
      }

      // Mock data cho scores vì API đang lỗi
      setScores([
        {
          id: 1,
          team_id: 1,
          judge_id: 1,
          creativity: 25,
          feasibility: 20,
          ai_effectiveness: 18,
          presentation: 12,
          social_impact: 10,
          total_score: 85,
          final_score: 89.5,
          vote_total: 50,
          comment: "Xuất sắc",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          team_id: 2,
          judge_id: 1,
          creativity: 23,
          feasibility: 22,
          ai_effectiveness: 19,
          presentation: 14,
          social_impact: 12,
          total_score: 90,
          final_score: 92.0,
          vote_total: 45,
          comment: "Rất tốt",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])

    } catch (err: any) {
      setError(err.message || "Lỗi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      const payload = {
        team_id: Number.parseInt(formData.team_id),
        judge_id: Number.parseInt(formData.judge_id),
        creativity: Number.parseFloat(formData.creativity),
        feasibility: Number.parseFloat(formData.feasibility),
        ai_effectiveness: Number.parseFloat(formData.ai_effectiveness),
        presentation: Number.parseFloat(formData.presentation),
        social_impact: Number.parseFloat(formData.social_impact),
        total_score: Number.parseFloat(formData.creativity) + Number.parseFloat(formData.feasibility) + 
                    Number.parseFloat(formData.ai_effectiveness) + Number.parseFloat(formData.presentation) + 
                    Number.parseFloat(formData.social_impact),
        vote_total: Number.parseInt(formData.vote_total) || 0,
        comment: formData.comment,
      }

      // Mock API call - thêm vào danh sách local
      const newScore: TeamsScoreFinal = {
        id: Date.now(), // Mock ID
        ...payload,
        final_score: payload.total_score * 0.7 + (payload.vote_total / 100) * 30, // Mock calculation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      if (editingScore) {
        // Update existing
        setScores(prev => prev.map(score => 
          score.id === editingScore.id ? { ...newScore, id: editingScore.id } : score
        ))
      } else {
        // Add new
        setScores(prev => [...prev, newScore])
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      resetForm()
    } catch (err: any) {
      setError(err.message || "Lỗi xử lý")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa điểm này?")) return
    
    try {
      // Mock delete - remove from local state
      setScores(prev => prev.filter(score => score.id !== id))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Lỗi xóa")
    }
  }

  const handleEdit = (score: TeamsScoreFinal) => {
    setEditingScore(score)
    setFormData({
      team_id: String(score.team_id),
      judge_id: String(score.judge_id),
      creativity: String(score.creativity),
      feasibility: String(score.feasibility),
      ai_effectiveness: String(score.ai_effectiveness),
      presentation: String(score.presentation),
      social_impact: String(score.social_impact),
      vote_total: String(score.vote_total),
      comment: score.comment || "",
    })
  }

  const resetForm = () => {
    setFormData({
      team_id: "",
      judge_id: "",
      creativity: "",
      feasibility: "",
      ai_effectiveness: "",
      presentation: "",
      social_impact: "",
      vote_total: "",
      comment: "",
    })
    setEditingScore(null)
  }

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId)
    return team?.team_name || `Team ${teamId}`
  }

  const getJudgeName = (judgeId: number) => {
    const judge = judges.find(j => j.id === judgeId)
    return judge?.full_name || judge?.username || `Judge ${judgeId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/images/ptit-logo.png"
                alt="PTIT Logo"
                width={40}
                height={40}
                className="bg-white rounded-lg p-1"
              />
              <div>
                <h1 className="font-bold text-xl text-gray-800">Admin - AIC Final</h1>
                <p className="text-sm text-gray-600">Quản lý điểm vòng chung kết</p>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs">
              ADMIN ONLY
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="mb-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
            <CheckCircle className="h-4 w-4" />
            Thao tác thành công!
          </div>
        )}

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Danh Sách Điểm</TabsTrigger>
            <TabsTrigger value="form">Thêm/Sửa Điểm</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Điểm Vòng Chung Kết</span>
                  <Badge variant="outline">{scores.length} bản ghi</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scores.map((score) => (
                    <Card key={score.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="font-semibold text-lg">{getTeamName(score.team_id)}</h3>
                              <Badge variant="secondary">Judge: {getJudgeName(score.judge_id)}</Badge>
                              <Badge className="bg-purple-100 text-purple-800">
                                Final: {score.final_score.toFixed(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                              <div className="bg-blue-50 p-2 rounded">
                                <div className="font-medium text-blue-800">Sáng tạo</div>
                                <div className="text-blue-600">{score.creativity}/25</div>
                              </div>
                              <div className="bg-green-50 p-2 rounded">
                                <div className="font-medium text-green-800">Khả thi</div>
                                <div className="text-green-600">{score.feasibility}/25</div>
                              </div>
                              <div className="bg-orange-50 p-2 rounded">
                                <div className="font-medium text-orange-800">AI</div>
                                <div className="text-orange-600">{score.ai_effectiveness}/20</div>
                              </div>
                              <div className="bg-purple-50 p-2 rounded">
                                <div className="font-medium text-purple-800">Thuyết trình</div>
                                <div className="text-purple-600">{score.presentation}/15</div>
                              </div>
                              <div className="bg-pink-50 p-2 rounded">
                                <div className="font-medium text-pink-800">Tác động</div>
                                <div className="text-pink-600">{score.social_impact}/15</div>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <span className="font-medium">Tổng: {score.total_score}/100</span>
                              <span>Vote: {score.vote_total}</span>
                              {score.comment && (
                                <span className="text-gray-500 italic">"{score.comment}"</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(score)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(score.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {scores.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <div>Chưa có dữ liệu điểm vòng chung kết</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingScore ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingScore ? "Sửa Điểm" : "Thêm Điểm Mới"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team_id">Chọn Team</Label>
                      <select
                        id="team_id"
                        value={formData.team_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value }))}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Chọn team --</option>
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="judge_id">Chọn Judge</Label>
                      <select
                        id="judge_id"
                        value={formData.judge_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, judge_id: e.target.value }))}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">-- Chọn judge --</option>
                        {judges.map(judge => (
                          <option key={judge.id} value={judge.id}>
                            {judge.full_name || judge.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="creativity">Sáng tạo (0-25)</Label>
                      <Input
                        id="creativity"
                        type="number"
                        min="0"
                        max="25"
                        value={formData.creativity}
                        onChange={(e) => setFormData(prev => ({ ...prev, creativity: e.target.value }))}
                        className="text-center"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="feasibility">Khả thi (0-25)</Label>
                      <Input
                        id="feasibility"
                        type="number"
                        min="0"
                        max="25"
                        value={formData.feasibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, feasibility: e.target.value }))}
                        className="text-center"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ai_effectiveness">AI (0-20)</Label>
                      <Input
                        id="ai_effectiveness"
                        type="number"
                        min="0"
                        max="20"
                        value={formData.ai_effectiveness}
                        onChange={(e) => setFormData(prev => ({ ...prev, ai_effectiveness: e.target.value }))}
                        className="text-center"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="presentation">Thuyết trình (0-15)</Label>
                      <Input
                        id="presentation"
                        type="number"
                        min="0"
                        max="15"
                        value={formData.presentation}
                        onChange={(e) => setFormData(prev => ({ ...prev, presentation: e.target.value }))}
                        className="text-center"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="social_impact">Tác động (0-15)</Label>
                      <Input
                        id="social_impact"
                        type="number"
                        min="0"
                        max="15"
                        value={formData.social_impact}
                        onChange={(e) => setFormData(prev => ({ ...prev, social_impact: e.target.value }))}
                        className="text-center"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="vote_total">Vote Total</Label>
                    <Input
                      id="vote_total"
                      type="number"
                      min="0"
                      value={formData.vote_total}
                      onChange={(e) => setFormData(prev => ({ ...prev, vote_total: e.target.value }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment">Nhận xét</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      rows={3}
                      placeholder="Nhận xét về đội thi..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1">
                      {editingScore ? "Cập nhật điểm" : "Thêm điểm mới"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
