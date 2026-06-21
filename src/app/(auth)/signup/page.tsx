"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
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
            interests: [], // default empty interests for new sign up
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
      {/* Right side Image (Flipped layout from sign-in for visual interest) */}
      <div className="hidden lg:flex w-1/2 relative bg-muted order-2">
        <Image
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80"
          alt="Curator exploring heritage"
          fill
          className="object-cover transition-transform hover:scale-105"
          style={{ transitionDuration: "10s" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-16 right-16 max-w-lg text-right">
          <span className="text-secondary-foreground text-sm font-bold tracking-widest uppercase mb-4 block drop-shadow-md">
            Join the Registry
          </span>
          <h2 className="text-4xl font-semibold text-white leading-tight drop-shadow-lg">
            Catalog and preserve history securely across the globe.
          </h2>
        </div>
      </div>

      {/* Left side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative overflow-hidden order-1">
        {/* Decorative background glow */}
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md glass p-10 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-fade-in-up">
          <Link href="/" className="inline-block mb-8 text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back to Home
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">Start your journey with CulturalVault.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block ml-1" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                placeholder="Johanna Explorer"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground block ml-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                placeholder="johanna@example.com"
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
                minLength={6}
                className="w-full p-3.5 bg-black/20 border border-white/10 rounded-xl outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all text-foreground placeholder:text-muted-foreground/50"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-secondary-foreground font-semibold rounded-xl transition-colors shadow-lg flex justify-center items-center mt-6 h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

                    <div className="mt-8">
            <div className="border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Already registered?{" "}
                 <Link
                  href="/signin"
                  className="text-orange-500 hover:text-orange-400 hover:underline font-semibold"
                >
                  Sign In
                </Link>
              </p>

              <p className="text-sm text-muted-foreground mt-3">
                Administrator?{" "}
                <Link
                  href="/admin/login"
                  className="text-orange-500 hover:text-orange-400 hover:underline font-semibold"
                >
                  Admin Sign In
                </Link>
              </p>
            </div>
          </div>

        </div> 
      </div> 
    </div>   
  );
}

