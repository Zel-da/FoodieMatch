import { Shield, Gauge, Book, Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3" data-testid="logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground korean-text">안전관리 교육 프로그램</h1>
              <p className="text-xs text-muted-foreground">Safety Management Education Program</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center"
              data-testid="nav-dashboard"
            >
              <Gauge className="w-4 h-4 mr-2" />
              대시보드
            </a>
            <a 
              href="#" 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center"
              data-testid="nav-help"
            >
              <Book className="w-4 h-4 mr-2" />
              도움말
            </a>
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="notification-button"
              >
                <Bell className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-sm font-medium korean-text" data-testid="user-name">관리자</span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
