"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/client/api";
import type { RssFeed } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function RssPanel() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<RssFeed[]>("/api/v1/feeds")
      .then((data) => {
        if (!cancelled) setFeeds(data);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error instanceof ApiError ? error.message : "加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function addFeed(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const validated = await api<{ title: string }>("/api/v1/feeds/validate", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      const created = await api<RssFeed>("/api/v1/feeds", {
        method: "POST",
        body: JSON.stringify({
          title: title || validated.title,
          url,
          enabled: true,
        }),
      });
      setFeeds((current) => [created, ...current]);
      setTitle("");
      setUrl("");
      toast.success("已添加 RSS 源");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "添加失败");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(feed: RssFeed, enabled: boolean) {
    try {
      const updated = await api<RssFeed>(`/api/v1/feeds/${feed.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });
      setFeeds((current) => current.map((item) => (item.id === feed.id ? updated : item)));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "更新失败");
    }
  }

  async function remove(feed: RssFeed) {
    try {
      await api(`/api/v1/feeds/${feed.id}`, { method: "DELETE" });
      setFeeds((current) => current.filter((item) => item.id !== feed.id));
      toast.success("已删除");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "删除失败");
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>添加 RSS 源</CardTitle>
          <CardDescription>填写源地址后会先校验，再写入你的个人配置。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto]" onSubmit={addFeed}>
            <div className="grid gap-2">
              <Label htmlFor="feed-title">名称</Label>
              <Input
                id="feed-title"
                placeholder="可选，留空则使用源标题"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feed-url">RSS / Atom URL</Label>
              <Input
                id="feed-url"
                type="url"
                required
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full bg-brand-gradient text-white md:w-auto">
                <Plus />
                {saving ? "校验中..." : "添加"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>已配置的源</CardTitle>
          <CardDescription>最多建议启用 10 个源，生成时只取近 24 小时条目。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {loading && (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          )}
          {!loading && feeds.length === 0 && (
            <p className="text-sm text-muted-foreground">还没有 RSS 源。先添加一个新闻或博客订阅。</p>
          )}
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{feed.title}</p>
                  <Badge variant={feed.enabled ? "secondary" : "outline"}>
                    {feed.enabled ? "已启用" : "已停用"}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{feed.url}</p>
                {feed.lastError && (
                  <p className="mt-1 text-xs text-destructive">{feed.lastError}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={feed.enabled}
                    onCheckedChange={(checked) => toggle(feed, checked)}
                    aria-label={`启用 ${feed.title}`}
                  />
                  <span className="text-xs text-muted-foreground">启用</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`删除 ${feed.title}`}
                  onClick={() => remove(feed)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
