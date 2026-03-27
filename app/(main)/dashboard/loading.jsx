"use client";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonTheme baseColor="#202020" highlightColor="#444">
        {/* Budget Progress */}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton width={220} />
            </CardTitle>
            <Skeleton width={260} />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton height={10} borderRadius={9999} />
            <div className="flex justify-end">
              <Skeleton width={70} />
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-normal">
                <Skeleton width={160} />
              </CardTitle>
              <Skeleton width={140} height={36} borderRadius={8} />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton width={180} />
                    <Skeleton width={120} />
                  </div>
                  <Skeleton width={90} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-normal">
                <Skeleton width={220} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-0 pb-5">
              <Skeleton circle width={160} height={160} />
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5 space-y-3">
              <Skeleton circle width={40} height={40} />
              <Skeleton width={140} />
            </CardContent>
          </Card>

          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardHeader className="space-y-2 pb-2">
                <Skeleton width={140} />
                <Skeleton width={90} height={20} />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton width={160} height={28} />
                <Skeleton width={120} />
              </CardContent>
            </Card>
          ))}
        </div>
      </SkeletonTheme>
    </div>
  );
}
