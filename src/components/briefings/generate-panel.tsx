"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/client/api";
import type { Briefing, GeneratedBriefing, LlmProfile, RssFeed } from "@/lib/types";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function todayLocal() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function GeneratePanel() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [profiles, setProfiles] = useState<LlmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<GeneratedBriefing | null>(null);

  const enabledFeeds = useMemo(() => feeds.filter((feed) => feed.enabled), [feeds]);
  const defaultProfile = profiles.find((profile) => profile.isDefault);

  useEffect(() => {
    Promise.all([
      api<RssFeed[]>("/api/v1/feeds"),
      api<LlmProfile[]>("/api/v1/llm-profiles"),
    ])
      .then(([nextFeeds, nextProfiles]) => {
        setFeeds(nextFeeds);
        setProfiles(nextProfiles);
      })
      .catch((error) => toast.error(error instanceof ApiError ? error.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const data = await api<GeneratedBriefing>("/api/v1/briefings/generate", {
        method: "POST",
        body: JSON.stringify({
          feedIds: enabledFeeds.slice(0, 10).map((feed) => feed.id),
        }),
      });
      setResult(data);
      toast.success("简讯已生成，可预览后保存");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!result) return;
    setSaving(true);
    try {
      const saved = await api<Briefing>("/api/v1/briefings", {
        method: "POST",
        body: JSON.stringify({
          title: result.title,
          markdown: result.markdown,
          date: todayLocal(),
          sourceFeedIds: result.sourceFeedIds,
          modelUsed: result.modelUsed,
        }),
      });
      toast.success("已保存到历史简讯");
      router.push(`/briefings/${saved.id}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>一键生成</CardTitle>
          <CardDescription>
            拉取已启用 RSS 的近 24 小时条目，交给默认大模型整理成 Markdown。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">默认模型</p>
                {defaultProfile ? (
                  <p className="mt-1 text-sm font-medium">
                    {defaultProfile.name} · {defaultProfile.model}
                  </p>
                ) : (
                  <p className="mt-1 text-sm">
                    尚未配置。请先到{" "}
                    <Link href="/settings" className="text-primary underline-offset-4 hover:underline">
                      个人中心
                    </Link>{" "}
                    添加模型档案。
                  </p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">将使用的 RSS 源</p>
                <div className="flex flex-wrap gap-2">
                  {enabledFeeds.length === 0 && (
                    <p className="text-sm">
                      没有启用的源。去{" "}
                      <Link href="/settings" className="text-primary underline-offset-4 hover:underline">
                        个人中心
                      </Link>{" "}
                      添加。
                    </p>
                  )}
                  {enabledFeeds.map((feed) => (
                    <Badge key={feed.id} variant="secondary">
                      {feed.title}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={generating || !defaultProfile || enabledFeeds.length === 0}
                  onClick={generate}
                  className="bg-brand-gradient text-white hover:opacity-90"
                >
                  <Sparkles />
                  {generating ? "生成中..." : "生成今日简讯"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!result || saving}
                  onClick={save}
                >
                  <Save />
                  {saving ? "保存中..." : "保存简讯"}
                </Button>
              </div>
              {result && (
                <div className="grid gap-2">
                  <p className="text-xs text-muted-foreground">源抓取结果</p>
                  {result.sources.map((source) => (
                    <p key={source.feedId} className="text-sm">
                      {source.title}：
                      {source.error ? (
                        <span className="text-destructive"> {source.error}</span>
                      ) : (
                        <span> {source.itemCount} 条</span>
                      )}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="min-h-[480px] rounded-2xl">
        <CardHeader>
          <CardTitle>Markdown 预览</CardTitle>
          <CardDescription>
            {result ? `${result.title} · ${result.modelUsed}` : "生成完成后在此阅读。"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generating ? (
            <div className="grid gap-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <MarkdownPreview markdown={result?.markdown ?? ""} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
