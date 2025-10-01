import { Header } from "@/components/header";

export default function HomePage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4 lg:p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">홈페이지</h1>
          <p className="mt-4 text-lg text-muted-foreground">공지사항 게시판이 여기에 표시될 예정입니다.</p>
        </div>
      </main>
    </div>
  );
}
