"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/client/api";
import type { BriefingSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryPanel() {
  const [date, setDate] = useState("");
  const [items, setItems] = useState<BriefingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  function load(nextDate?: string) {
    setLoading(true);
    const query = nextDate ? `?date=${nextDate}` : "";
    api<BriefingSummary[]>(`/api/v1/briefings${query}`)
      .then(setItems)
      .catch((error) => toast.error(error instanceof ApiError ? error.message : "加载失败"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const query = "";
    api<BriefingSummary[]>(`/api/v1/briefings${query}`)
      .then(setItems)
      .catch((error) => toast.error(error instanceof ApiError ? error.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>按日期筛选</CardTitle>
          <CardDescription>按你保存时的本地日历日过滤。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="briefing-date">日期</Label>
            <Input
              id="briefing-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => load(date || undefined)}>
              筛选
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDate("");
                void load();
              }}
            >
              清除
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {loading && (
          <>
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </>
        )}
        {!loading && items.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="py-8 text-sm text-muted-foreground">
              没有找到简讯。先去生成并保存一条。
            </CardContent>
          </Card>
        )}
        {items.map((item) => (
          <Link key={item.id} href={`/briefings/${item.id}`}>
            <Card className="rounded-2xl transition-colors duration-200 hover:bg-accent/40">
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>
                  {item.date} · {item.modelUsed} · {item.sourceFeedIds.length} 个源
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
