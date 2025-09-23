import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "./progress-ring";
import { Play, Book, CheckCircle } from "lucide-react";
import { Course, UserProgress } from "@shared/schema";
import { COURSE_TYPES } from "@/lib/constants";

interface CourseCardProps {
  course: Course;
  progress?: UserProgress;
  onStartCourse: (courseId: string) => void;
}

export function CourseCard({ course, progress, onStartCourse }: CourseCardProps) {
  const courseType = COURSE_TYPES[course.type as keyof typeof COURSE_TYPES];
  const progressPercent = progress?.progress || 0;
  const isCompleted = progress?.completed || false;

  const getButtonConfig = () => {
    switch (course.type) {
      case 'workplace-safety':
        return {
          text: '교육 시작하기',
          icon: Play,
          testId: 'button-start-workplace-safety'
        };
      case 'hazard-prevention':
        return {
          text: '교육 자료 보기 시작',
          icon: Book,
          testId: 'button-start-hazard-prevention'
        };
      case 'tbm':
        return {
          text: 'TBM 교육 받기',
          icon: CheckCircle,
          testId: 'button-start-tbm'
        };
      default:
        return {
          text: '교육 시작하기',
          icon: Play,
          testId: 'button-start-course'
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      data-testid={`course-card-${course.type}`}
    >
      <CardContent className="p-6">
        <div className={`flex items-center justify-center w-16 h-16 ${courseType.bgColor} rounded-full mb-4 mx-auto`}>
          <div className={`${courseType.textColor} text-2xl`}>
            {course.type === 'workplace-safety' && <div className="i-fas-hard-hat" />}
            {course.type === 'hazard-prevention' && <div className="i-fas-exclamation-triangle" />}
            {course.type === 'tbm' && <CheckCircle className="w-8 h-8" />}
          </div>
        </div>

        <h3 
          className="text-xl font-semibold text-center mb-2 korean-text" 
          data-testid={`course-title-${course.type}`}
        >
          {course.title}
        </h3>

        {course.type === 'hazard-prevention' && (
          <Badge 
            className={`${courseType.bgColor} ${courseType.textColor} mb-4 mx-auto block w-fit`}
            data-testid="course-date-badge"
          >
            2022.10.18 개정 시행
          </Badge>
        )}

        {course.type === 'tbm' && (
          <Badge 
            className={`${courseType.bgColor} ${courseType.textColor} mb-4 mx-auto block w-fit`}
            data-testid="course-type-badge"
          >
            Tool Box Meeting
          </Badge>
        )}

        <p 
          className="text-sm text-muted-foreground text-center mb-6 korean-text" 
          data-testid={`course-description-${course.type}`}
        >
          {course.description}
        </p>

        {/* Progress Ring for workplace safety */}
        {course.type === 'workplace-safety' && (
          <div className="flex justify-center mb-4">
            <ProgressRing progress={progressPercent} />
          </div>
        )}

        {/* Additional info for hazard prevention */}
        {course.type === 'hazard-prevention' && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs mb-6" data-testid="hazard-prevention-info">
            <div>
              <div className={`font-medium ${courseType.textColor}`}>중요공지</div>
              <div>사업주의 통제</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>중요공지</div>
              <div>무원문제유형</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>공지사항</div>
              <div>최소안전관리</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>기술지침</div>
              <div>지침절차의 확정</div>
            </div>
          </div>
        )}

        {/* Additional info for TBM */}
        {course.type === 'tbm' && (
          <div className="grid grid-cols-2 gap-4 text-xs mb-6" data-testid="tbm-info">
            <div>
              <div className={`font-medium ${courseType.textColor}`}>10월 일정</div>
              <div>요일시 진행</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>위험성평가</div>
              <div>기업 시설수업</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>예방메모</div>
              <div>확장 국유이론</div>
            </div>
            <div>
              <div className={`font-medium ${courseType.textColor}`}>소통개선</div>
              <div>현과그 간업</div>
            </div>
          </div>
        )}

        <Button
          className={`w-full ${courseType.buttonColor} text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center korean-text`}
          onClick={() => onStartCourse(course.id)}
          data-testid={buttonConfig.testId}
        >
          <ButtonIcon className="w-4 h-4 mr-2" />
          {buttonConfig.text}
        </Button>
      </CardContent>
    </Card>
  );
}
