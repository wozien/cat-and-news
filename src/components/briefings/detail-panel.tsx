"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/client/api";
import type { Briefing } from "@/lib/types";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DetailPanel({ id }: { id: string }) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);

  useEffect(() => {
    api<Briefing>(`/api/v1/briefings/${id}`).then(setBriefing).catch((error) => {
      toast.error(error instanceof ApiError ? error.message : "加载失败");
    });
  }, [id]);

  return (
    <div className="grid gap-4">
      <Button variant="ghost" className="w-fit" render={<Link href="/briefings" />}>
        <ArrowLeft />
        返回历史
      </Button>
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>{briefing?.title ?? "简讯详情"}</CardTitle>
          <CardDescription>
            {briefing ? `${briefing.date} · ${briefing.modelUsed}` : "正在读取已保存的 Markdown"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {briefing ? (
            <MarkdownPreview markdown={briefing.markdown} />
          ) : (
            <div className="grid gap-3">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
