import { Button } from '@components/ui/button';
import { Card, CardContent } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Separator } from '@components/ui/separator';
import { MoreHorizontal, Search, CalendarPlus } from 'lucide-react';
import Link from 'next/link';

export default function Timetable() {
  return (
    <div className="container mx-auto max-w-5xl px-4 pb-12">
      <div className="mt-10 mb-6">
        <h3 className="text-2xl font-bold">
          내 시간표들 📅
        </h3>
        <Separator className="my-4" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 w-full sm:w-[300px]"
          />
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <CalendarPlus className="mr-2 h-4 w-4" />
            시간표 추가하기
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <h4 className="text-lg font-semibold">뭔가 모를 컬렉션</h4>

        <div className="flex flex-col gap-4">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardContent className="p-6 flex items-start justify-between">
              <div>
                <Link href={`timetable/1`} className="text-xl font-semibold hover:underline decoration-2 underline-offset-4">
                  1번 시간표
                </Link>
                <p className="text-muted-foreground mt-2">시간표 설명~설명~ </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
