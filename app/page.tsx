import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Users, FileText, Gavel } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ScrollReveal from "@/components/scroll-reveal"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
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
                AIC 2025
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="#info">Thông Tin</Link>
              </Button>
              
              <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
                <Link href="/judges/login">
                  <Gavel className="h-4 w-4" />
                  Giám Khảo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary/80 text-white animate-gradient">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-in-left">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/images/ptit-logo.png"
                  alt="PTIT Logo"
                  width={60}
                  height={60}
                  className="bg-white rounded-lg p-2 hover-scale transition-all duration-300"
                />
                <Image
                  src="/images/university-logo.png"
                  alt="University Logo"
                  width={60}
                  height={60}
                  className="bg-white rounded-lg p-2 hover-scale transition-all duration-300 stagger-1"
                />
                <Image
                  src="/images/shine-thrive-logo.png"
                  alt="Shine and Thrive"
                  width={60}
                  height={60}
                  className="bg-white rounded-lg p-2 hover-scale transition-all duration-300 stagger-2"
                />
              </div>

              <div>
                <Badge className="bg-accent text-accent-foreground mb-4 text-lg px-4 py-2 animate-fade-in stagger-3">CUỘC THI AIC 2025</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance animate-slide-up stagger-4">
                  {"Khám Phá Tương Lai Trí Tuệ Nhân Tạo"}
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 mb-8 text-pretty animate-fade-in stagger-5">
                  {
                    "Tham gia cuộc thi AI Innovation Challenge 2025 - Nơi những ý tưởng sáng tạo về AI trở thành hiện thực"
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-6">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-4 hover-lift hover-glow transition-all duration-300"
                >
                  <Link href="/submit">Nộp Bài Thi Ngay</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 bg-transparent hover-lift transition-all duration-300"
                >
                  <Link href="#info">Tìm Hiểu Thêm</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-slide-in-right">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl scale-150 animate-pulse-gentle" />
                <Image
                  src="/images/robot-mascot.png"
                  alt="AI Robot Mascot"
                  width={400}
                  height={400}
                  className="relative z-10 drop-shadow-2xl animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Info Section */}
      <section id="info" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-balance">Thông Tin Cuộc Thi</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                AIC 2025 là cuộc thi dành cho sinh viên về trí tuệ nhân tạo, khuyến khích sự sáng tạo và ứng dụng AI trong
                thực tế
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <ScrollReveal delay={100}>
              <Card className="hover-lift hover-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 mx-auto text-primary mb-4 animate-bounce-gentle" />
                  <CardTitle>Đối Tượng Tham Gia</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Tất cả sinh viên các ĐH, CĐ toàn quốc</li>
                    <li>Ít nhất 2 SV ngành CNTT định hướng ứng dụng</li>
                    <li>Nhóm 3-4 thành viên (tối thiểu 1 nam, 1 nữ)</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="hover-lift hover-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-primary mb-4 animate-bounce-gentle" />
                  <CardTitle>Yêu Cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Tính ứng dụng cao: giáo dục, cộng đồng & xã hội, văn hóa-ngôn ngữ & nội dung</li>
                    <li>Đổi mới sáng tạo: khác biệt, khả thi, có thể triển khai</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="hover-lift hover-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <Calendar className="w-12 h-12 mx-auto text-primary mb-4 animate-bounce-gentle" />
                  <CardTitle>Thời Gian</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>15/09: Hạn đăng ký đội</li>
                    <li>19/09: Nộp sản phẩm ý tưởng</li>
                    <li>21/09: Vòng 1 (Ý tưởng) + Công bố kết quả</li>
                    <li>22/09–02/10: Phát triển sản phẩm</li>
                    <li>03/10: Vòng Chung kết</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Card className="hover-lift hover-glow transition-all duration-300">
                <CardHeader className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-primary mb-4 animate-bounce-gentle" />
                  <CardTitle>Hình Thức</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vòng 1: nộp tài liệu + thuyết trình. Chung kết: thuyết trình trực tiếp & demo.
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Competition Rounds */}
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="hover-lift hover-glow transition-all duration-300 animate-slide-up stagger-1">
              <CardHeader>
                <CardTitle className="text-primary">Vòng 1: Ý Tưởng</CardTitle>
                <CardDescription>21/09</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Các đội nộp tài liệu và thuyết trình trước Ban giám khảo.</p>
                <div className="space-y-2">
                  <p className="font-semibold">Tài liệu cần nộp:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Báo cáo chi tiết (5–10 trang): giới thiệu, lý do, chức năng, mô hình kinh doanh, khó khăn, hướng phát triển, phân công</li>
                    <li>• Slide thuyết trình</li>
                    <li>• Video demo sản phẩm</li>
                    <li>• Source code</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift hover-glow transition-all duration-300 animate-slide-up stagger-2">
              <CardHeader>
                <CardTitle className="text-primary">Giai Đoạn Phát Triển</CardTitle>
                <CardDescription>22/09 – 02/10</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Các đội hoàn thiện sản phẩm theo góp ý từ vòng ý tưởng, chuẩn bị demo.</p>
              </CardContent>
            </Card>

            <Card className="hover-lift hover-glow transition-all duration-300 animate-slide-up stagger-3">
              <CardHeader>
                <CardTitle className="text-primary">Vòng Chung Kết</CardTitle>
                <CardDescription>03/10</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Thuyết trình trực tiếp trước Ban Giám khảo, demo sản phẩm, trả lời câu hỏi chuyên sâu.</p>
                <div className="space-y-2">
                  <p className="font-semibold">Nội dung trình bày:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Chức năng chính, công nghệ sử dụng</li>
                    <li>• Giải pháp thực tế, tiềm năng phát triển</li>
                    <li>• Demo sản phẩm trực tiếp</li>
                    <li>• Q&A cùng Ban Giám khảo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 animate-slide-up">Giải Thưởng Hấp Dẫn</h2>
            <p className="text-xl text-muted-foreground animate-fade-in stagger-1">
              Tổng giá trị giải thưởng lên đến 100 triệu VNĐ cùng nhiều cơ hội phát triển
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-2 border-accent bg-accent/5 hover-lift hover-glow transition-all duration-300 animate-scale-in stagger-1">
              <CardHeader>
                <Trophy className="w-16 h-16 mx-auto text-accent mb-4 animate-bounce-gentle" />
                <CardTitle className="text-foreground">Giải Nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">5.000.000đ</p>
                <p className="text-sm text-muted-foreground">+ Chứng nhận + Quà tặng</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift hover-glow transition-all duration-300 animate-scale-in stagger-2">
              <CardHeader>
                <Trophy className="w-16 h-16 mx-auto text-primary mb-4 animate-bounce-gentle" />
                <CardTitle>Giải Nhì</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">3.000.000đ</p>
                <p className="text-sm text-muted-foreground">+ Chứng nhận + Quà tặng</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift hover-glow transition-all duration-300 animate-scale-in stagger-3">
              <CardHeader>
                <Trophy className="w-16 h-16 mx-auto text-secondary mb-4 animate-bounce-gentle" />
                <CardTitle>Giải Ba</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">2.000.000đ</p>
                <p className="text-sm text-muted-foreground">+ Chứng nhận + Quà tặng</p>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift hover-glow transition-all duration-300 animate-scale-in stagger-4">
              <CardHeader>
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4 animate-bounce-gentle" />
                <CardTitle>Giải Phụ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nhiều hạng mục đặc biệt, phần quà hấp dẫn</p>
                <p className="text-xs text-muted-foreground">(Sẽ công bố chi tiết tại sự kiện)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Liên Hệ</h3>
              <p className="text-white/80">Email: aic2025@ptit.edu.vn</p>
              <p className="text-white/80">Hotline: 024.3868.3333</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Địa Chỉ</h3>
              <p className="text-white/80">
                Học viện Công nghệ Bưu chính Viễn thông
                <br />
                Km10, Đường Nguyễn Trãi, Hà Đông, Hà Nội
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Theo Dõi</h3>
              <p className="text-white/80">Website: ptit.edu.vn</p>
              <p className="text-white/80">Facebook: /ptit.official</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/60">© 2025 AI Innovation Challenge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
