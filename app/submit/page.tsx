"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Users, FileText, Presentation, Video, Code, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SubmitPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [teamData, setTeamData] = useState({
    teamName: "",
    leaderName: "",
    studentId: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [teamId, setTeamId] = useState<number | null>(null)
  const [reportLink, setReportLink] = useState("")
  const [slideLink, setSlideLink] = useState("")
  const [videoLink, setVideoLink] = useState("")
  const [sourceCodeLink, setSourceCodeLink] = useState("")
  const [successOpen, setSuccessOpen] = useState(false)

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!teamData.studentId || !teamData.teamName) {
      setErrorMsg("Vui lòng nhập tên đội và mã sinh viên (leader_code)")
      return
    }
    try {
      setLoading(true)
      const url = `https://unibackend.iuptit.com/api/v1/teams/teams-ver2/check-leader-team?leader_code=${encodeURIComponent(teamData.studentId)}&Team_name=${encodeURIComponent(teamData.teamName)}`
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) {
        setErrorMsg('Team không tồn tại danh sách, vui lòng liên hệ ban tổ chức để được hỗ trợ')
        return
      }
      const json = await res.json()
      const id = json?.data?.id
      if (id) setTeamId(id)
      setCurrentStep(2)
    } catch (err: any) {
      setErrorMsg('Team không tồn tại danh sách, vui lòng liên hệ ban tổ chức để được hỗ trợ')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!teamId) {
      setErrorMsg('Không tìm thấy team. Vui lòng quay lại bước 1 để xác thực.')
      return
    }
    try {
      setLoading(true)
      const form = new FormData()
      if (teamData.teamName) form.append('team_name', teamData.teamName)
      if (teamData.leaderName) form.append('name_leader', teamData.leaderName)
      if (teamData.studentId) form.append('code_leader', teamData.studentId)
      if (teamData.email) form.append('email_ptit_leader', teamData.email)
      if (teamData.phone) form.append('phone_leader', teamData.phone)
      if (reportLink) form.append('survey_link', reportLink)
      if (slideLink) form.append('slide_link', slideLink)
      if (videoLink) form.append('video_link', videoLink)
      if (sourceCodeLink) form.append('source_code_link', sourceCodeLink)
      const url = `https://unibackend.iuptit.com/api/v1/teams/teams-ver2/${teamId}`
      const res = await fetch(url, { method: 'PUT', body: form })
      if (!res.ok) {
        setErrorMsg('Cập nhật thông tin đội thất bại. Vui lòng thử lại hoặc liên hệ BTC.')
        return
      }
      setSuccessOpen(true)
    } catch {
      setErrorMsg('Cập nhật thông tin đội thất bại. Vui lòng thử lại hoặc liên hệ BTC.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80">
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </Link>
              <div className="h-6 w-px bg-white/30" />
              <h1 className="text-2xl font-bold">Nộp Bài Thi AIC 2025</h1>
            </div>
            <div className="flex items-center gap-4">
              <Image src="/images/robot-mascot.png" alt="AI Robot" width={50} height={50} className="drop-shadow-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary text-white" : "bg-muted"}`}
              >
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-medium">Thông Tin Đội Thi</span>
            </div>
            <div className={`w-16 h-px ${currentStep > 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary text-white" : "bg-muted"}`}
              >
                2
              </div>
              <span className="font-medium">Nộp Tài Liệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Phần 1: Thông Tin Đội Thi
                </CardTitle>
                <CardDescription>Vui lòng điền đầy đủ thông tin về đội thi và trưởng nhóm</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTeamSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tên Đội <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập tên đội thi"
                        value={teamData.teamName}
                        onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tên Leader <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập tên trưởng nhóm"
                        value={teamData.leaderName}
                        onChange={(e) => setTeamData({ ...teamData, leaderName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mã Sinh Viên Leader <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập mã sinh viên"
                        value={teamData.studentId}
                        onChange={(e) => setTeamData({ ...teamData, studentId: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Leader <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập email liên hệ"
                        value={teamData.email}
                        onChange={(e) => setTeamData({ ...teamData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Số Điện Thoại Leader <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Nhập số điện thoại"
                        value={teamData.phone}
                        onChange={(e) => setTeamData({ ...teamData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  )}

                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                      disabled={loading}
                    >
                      {loading ? 'Đang kiểm tra...' : 'Tiếp Theo'}
                      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Phần 2: Nộp Tài Liệu
                </CardTitle>
                <CardDescription>Tải lên các tài liệu yêu cầu cho cuộc thi</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Team Info Summary */}
                <div className="bg-muted/50 rounded-lg p-4 mb-8">
                  <h3 className="font-semibold mb-2">Thông tin đội thi:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p>
                      <span className="font-medium">Tên đội:</span> {teamData.teamName}
                    </p>
                    <p>
                      <span className="font-medium">Leader:</span> {teamData.leaderName}
                    </p>
                    <p>
                      <span className="font-medium">MSSV:</span> {teamData.studentId}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {teamData.email}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)} className="mt-3">
                    Chỉnh sửa thông tin
                  </Button>
                </div>

                <form onSubmit={handleDocumentSubmit} className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Báo Cáo Chi Tiết (link Google Drive) <span className="text-destructive">*</span>
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gồm: giới thiệu, lý do, chức năng chính, mô hình kinh doanh, khó khăn, hướng phát triển, phân công.
                    </p>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://drive.google.com/..."
                      value={reportLink}
                      onChange={(e) => setReportLink(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Presentation className="w-4 h-4" />
                      Slide Thuyết Trình (link) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://drive.google.com/..."
                      value={slideLink}
                      onChange={(e) => setSlideLink(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Demo Sản Phẩm (link YouTube) <span className="text-destructive">*</span>
                    </label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Dán link YouTube giới thiệu chức năng, giao diện sản phẩm
                    </p>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Mã Nguồn (link repository) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://github.com/... hoặc link Drive"
                      value={sourceCodeLink}
                      onChange={(e) => setSourceCodeLink(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep(1)}
                      className="px-8 py-3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay Lại
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                    >
                      Nộp Bài Thi
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    <Dialog open={successOpen} onOpenChange={(open) => {
      setSuccessOpen(open)
      if (!open) router.push('/')
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nộp bài thành công</DialogTitle>
          <DialogDescription>
            Cảm ơn bạn đã tham gia AIC 2025. Hệ thống sẽ chuyển bạn về trang chủ.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
