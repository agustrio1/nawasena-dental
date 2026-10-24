"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Email atau password tidak valid.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-forest">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-forest">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}
