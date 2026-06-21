"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      localStorage.setItem("user_token", data.token);
      if (data.user) {
        localStorage.setItem(
          "userAccount",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
          })
        );
        localStorage.setItem(
          "user_profile",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: "",
            interests: ["Architecture", "Art"], // default starting interests
            createdAt: new Date().toISOString(),
          })
        );
      }
      router.push("/explore");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side Image */}
      <div className="hidden lg:flex w-1/2 relative bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1600&q=80"
          alt="Cultural Heritage"
          fill
          className="object-cover transition-transform hover:scale-105"
          style={{ transitionDuration: "10s" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-16 left-16 max-w-lg">
          <span className="text-primary/90 text-sm font-bold tracking-widest uppercase mb-4 block drop-shadow-md">
            Cultural Vault
          </span>
          <h2 className="text-4xl font-semibold text-white leading-tight drop-shadow-lg">
            Discover the world's most breathtaking heritage items.
          </h2>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md glass p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-fade-in-up">
          <Link href="/" className="inline-block mb-8 text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back to Home
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your CulturalVault account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block ml-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                placeholder="demo@culturalvault.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block ml-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20 mt-4 flex justify-center items-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
