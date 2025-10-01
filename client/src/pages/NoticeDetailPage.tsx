import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Notice } from "@shared/schema";
import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NoticeDetailPage() {
  const [match, params] = useRoute("/notices/:id");
  const noticeId = params?.id;

  const { data: notice, isLoading, error } = useQuery<Notice>({
    queryKey: [`/api/notices/${noticeId}`],
    enabled: !!noticeId,
  });

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 lg:p-6">
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Link>
          </Button>
        </div>
        {isLoading && <p>공지사항을 불러오는 중...</p>}
        {error && <p className="text-destructive">오류: {error.message}</p>}
        {notice && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{notice.title}</CardTitle>
              <div className="text-sm text-muted-foreground pt-2">
                <span>작성일: {new Date(notice.createdAt).toLocaleString()}</span>
                <span className="mx-2">|</span>
                <span>조회수: {notice.viewCount}</span>
              </div>
            </CardHeader>
            <CardContent className="prose max-w-none mt-6">
              <p>{notice.content}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
