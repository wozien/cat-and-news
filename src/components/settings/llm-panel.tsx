"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/client/api";
import type { LlmProfile, LlmProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROVIDER_PRESETS: Record<LlmProvider, { label: string; baseUrl: string; model: string }> = {
  openai_compatible: {
    label: "OpenAI 兼容",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
  },
  anthropic: {
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-5",
  },
};

export function LlmPanel() {
  const [profiles, setProfiles] = useState<LlmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<LlmProvider>("openai_compatible");
  const [baseUrl, setBaseUrl] = useState(PROVIDER_PRESETS.openai_compatible.baseUrl);
  const [model, setModel] = useState(PROVIDER_PRESETS.openai_compatible.model);
  const [apiKey, setApiKey] = useState("");

  function refresh() {
    return api<LlmProfile[]>("/api/v1/llm-profiles").then(setProfiles);
  }

  useEffect(() => {
    let cancelled = false;
    api<LlmProfile[]>("/api/v1/llm-profiles")
      .then((data) => {
        if (!cancelled) setProfiles(data);
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

  function applyProvider(next: LlmProvider) {
    setProvider(next);
    setBaseUrl(PROVIDER_PRESETS[next].baseUrl);
    setModel(PROVIDER_PRESETS[next].model);
  }

  async function createProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await api<LlmProfile>("/api/v1/llm-profiles", {
        method: "POST",
        body: JSON.stringify({
          name,
          provider,
          baseUrl,
          model,
          apiKey,
        }),
      });
      setProfiles((current) => [created, ...current.map((item) => (
        created.isDefault ? { ...item, isDefault: false } : item
      ))]);
      setName("");
      setApiKey("");
      toast.success("已保存模型档案");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(profile: LlmProfile) {
    try {
      const updated = await api<LlmProfile>(`/api/v1/llm-profiles/${profile.id}/default`, {
        method: "POST",
      });
      setProfiles((current) =>
        current.map((item) => ({ ...item, isDefault: item.id === updated.id })),
      );
      toast.success(`已切换到 ${updated.name}`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "切换失败");
    }
  }

  async function remove(profile: LlmProfile) {
    try {
      await api(`/api/v1/llm-profiles/${profile.id}`, { method: "DELETE" });
      await refresh();
      toast.success("已删除");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "删除失败");
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>新增模型档案</CardTitle>
          <CardDescription>
            支持 OpenAI 兼容接口（DeepSeek / OpenRouter）和 Anthropic。密钥加密存储，界面只显示末四位。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={createProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="llm-name">档案名称</Label>
                <Input
                  id="llm-name"
                  required
                  placeholder="例如 DeepSeek 日常"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="llm-provider">厂商协议</Label>
                <Select
                  value={provider}
                  onValueChange={(value) => {
                    if (value) applyProvider(value as LlmProvider);
                  }}
                >
                  <SelectTrigger id="llm-provider" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai_compatible">OpenAI 兼容</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="llm-base">Base URL</Label>
                <Input
                  id="llm-base"
                  type="url"
                  required
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="llm-model">模型</Label>
                <Input
                  id="llm-model"
                  required
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="llm-key">API Key</Label>
              <Input
                id="llm-key"
                type="password"
                required
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
            </div>
            <div>
              <Button type="submit" disabled={saving} className="bg-brand-gradient text-white">
                <Plus />
                {saving ? "保存中..." : "保存档案"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>已保存档案</CardTitle>
          <CardDescription>生成简讯时使用默认档案。可随时切换。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {loading && (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          )}
          {!loading && profiles.length === 0 && (
            <p className="text-sm text-muted-foreground">还没有模型档案。先添加一个才能生成简讯。</p>
          )}
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col gap-3 rounded-xl border px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{profile.name}</p>
                  {profile.isDefault && <Badge>默认</Badge>}
                  <Badge variant="outline">
                    {PROVIDER_PRESETS[profile.provider]?.label ?? profile.provider}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profile.model} · {profile.apiKeyHint}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!profile.isDefault && (
                  <Button type="button" variant="outline" onClick={() => makeDefault(profile)}>
                    <Check />
                    设为默认
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`删除 ${profile.name}`}
                  onClick={() => remove(profile)}
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
