"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
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
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message || "登录失败");
      return;
    }

    router.replace(nextPath);
  }

  async function social(provider: "github" | "google") {
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: nextPath,
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
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>
              登录后配置 RSS 与大模型，一键生成当日简讯。
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
                  autoComplete="current-password"
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
                {loading ? "登录中..." : "登录"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              还没有账号？{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                注册
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
