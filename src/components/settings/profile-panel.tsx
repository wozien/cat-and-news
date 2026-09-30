"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfilePanel() {
  const { data: session } = authClient.useSession();
  const [draftName, setDraftName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = draftName ?? session?.user.name ?? "";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const { error } = await authClient.updateUser({ name });
    setSaving(false);
    if (error) {
      toast.error(error.message || "更新失败");
      return;
    }
    toast.success("资料已更新");
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>基础资料</CardTitle>
        <CardDescription>邮箱用于登录识别，当前版本不支持修改邮箱。</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid max-w-lg gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="profile-name">昵称</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setDraftName(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">邮箱</Label>
            <Input id="profile-email" value={session?.user.email ?? ""} disabled />
          </div>
          <div>
            <Button type="submit" disabled={saving} className="bg-brand-gradient text-white">
              {saving ? "保存中..." : "保存资料"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
