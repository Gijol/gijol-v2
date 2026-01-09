import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@components/ui/carousel';
import { Card, CardContent } from '@components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface Review {
  name: string;
  grade: string;
  color: string;
  review: string;
}

const reviews: Review[] = [
  {
    name: '익명',
    grade: '전기전자컴퓨터공학부 2학년',
    color: 'blue',
    review:
      '학교 생활을 어느정도 지내다 보니, 3학년을 지나 4학년을 앞두고 있는데 지금까지 어떤 강의를 들었고, 앞으로 어떤 강의를 들어야 하는지 너무 막막했었어요. 그런데 Gijol 서비스를 이용하고 나니 길이 보이는 것 같아요! 이런 서비스 만들어주셔서 감사합니다!',
  },
  {
    name: '황인선',
    grade: '전기전자컴퓨터공학부 3학년',
    color: 'blue',
    review:
      '학사편람 책으로 졸업이수조건을 찾아가며 불편하게 졸업 학점을 계산했는데, 클릭 몇 번만으로 어떤 수업을 들어야할지 알 수 있어 너무 편리해요..!! 🥹',
  },
  {
    name: '최승규',
    grade: '물리광과학부 4학년',
    color: 'orange',
    review:
      '들은 과목이 너무 많아서 졸업을 위해 필요한게 무엇인지 정리하기 어려웠는데 한눈에 보기좋게 정리해 보여줘서 짱이다!',
  },
];

export default function UserReviews() {
  return (
    <div className="w-full flex justify-center py-20 px-4">
      <Carousel
        opts={{
          loop: true,
          align: "center",
        }}
        className="w-full max-w-4xl"
      >
        <CarouselContent className="-ml-4">
          {reviews.map((r, i) => (
            <CarouselItem key={i} className="pl-4 basis-full flex justify-center">
              <Card className="w-[544px] max-w-full h-fit max-h-[340px] shadow-sm rounded-2xl border bg-white dark:bg-slate-950 dark:border-slate-800">
                <CardContent className="p-6 pb-10 flex flex-col justify-start gap-4">
                  <div className="flex flex-row items-center gap-4 px-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-800">
                        <User className="h-6 w-6 text-slate-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        {r.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit font-normal text-sm",
                          r.color === 'blue' && "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-900/20",
                          r.color === 'orange' && "border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-900/20"
                        )}
                      >
                        {r.grade}
                      </Badge>
                    </div>
                  </div>
                  <p className="px-10 text-start text-base text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-keep leading-relaxed">
                    {r.review}
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="left-[-50px]" />
          <CarouselNext className="right-[-50px]" />
        </div>
      </Carousel>
    </div>
  );
}
