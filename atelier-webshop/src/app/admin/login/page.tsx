"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const supabase = getBrowserSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          setError(
            "Invalid login credentials. Reset this user password in Supabase Authentication > Users, then try again.",
          );
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (data?.session) {
        // Successfully logged in, redirect to admin
        router.push("/admin");
        return;
      }

      setError("Login did not complete. Please try again.");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-neutral-100)] px-6">
      <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-8">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Owner Login</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Sign in to manage products and inventory.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)]">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--color-ink)] transition focus:border-[var(--color-wood)] focus:outline-none focus:ring-1 focus:ring-[var(--color-wood)]/20"
              placeholder="•••••••••••"
            />
            <label className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-wood-dark)]"
              />
              Show password
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
