"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client/api";
import { authClient } from "@/lib/auth-client";
import type { AuthOptions } from "@/lib/types";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<AuthOptions>({ github: false, google: false });

  useEffect(() => {
    api<AuthOptions>("/api/v1/auth-options")
      .then(setProviders)
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message || "注册失败");
      return;
    }

    router.replace("/");
  }

  async function social(provider: "github" | "google") {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
    if (error) {
      toast.error(error.message || "第三方登录失败");
    }
  }

  return (
    <div className="surface-grid flex min-h-svh flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <BrandMark />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md rounded-2xl">
          <CardHeader className="gap-2">
            <CardTitle className="text-2xl">创建账号</CardTitle>
            <CardDescription>
              用邮箱注册，或通过 GitHub / Google 快速开始。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {(providers.github || providers.google) && (
              <div className="grid gap-2">
                {providers.github && (
                  <Button type="button" variant="outline" onClick={() => social("github")}>
                    使用 GitHub 继续
                  </Button>
                )}
                {providers.google && (
                  <Button type="button" variant="outline" onClick={() => social("google")}>
                    使用 Google 继续
                  </Button>
                )}
                <div className="flex items-center gap-3 py-1">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">或使用邮箱</span>
                  <Separator className="flex-1" />
                </div>
              </div>
            )}
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">昵称</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-gradient text-white hover:opacity-90"
              >
                {loading ? "创建中..." : "注册"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              已有账号？{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
