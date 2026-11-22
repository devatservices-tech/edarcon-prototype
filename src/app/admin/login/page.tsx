"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, AlertTriangle, Loader2, Shield, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const DEMO_CREDENTIALS = [
  { email: "admin@edarcon.com", password: "Admin@123", role: "Super Admin" },
  { email: "editor@edarcon.com", password: "Editor@123", role: "Editor" },
  { email: "sales@edarcon.com", password: "Sales@123", role: "Sales" },
];

const FEATURES = [
  { icon: Briefcase, label: "Manage services & projects", desc: "Bilingual content management" },
  { icon: Users, label: "Equipment & manpower", desc: "Track availability & headcount" },
  { icon: Shield, label: "Certificates & compliance", desc: "ISO & vendor approvals" },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        throw new Error("Invalid email or password");
      }
      await res.json();
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    form.reset({ email, password });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left panel - Brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-brand-blue text-2xl font-bold mb-6 shadow-lg">
            E
          </div>
          <h2 className="text-3xl font-bold mb-2 text-center">Edarcon</h2>
          <p className="text-brand-blue/90 text-center max-w-md mb-8 leading-relaxed">
            Industrial &amp; Civil Contracting — Eastern Province, Saudi Arabia
          </p>
          <div className="w-full space-y-4 text-sm text-brand-blue/90 max-w-md">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-brand-blue" />
                </div>
                <div>
                  <p className="font-medium">{f.label}</p>
                  <p className="text-xs opacity-80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-xs text-brand-blue/70 uppercase tracking-wider">
            Admin Portal v1.0 • Prototype
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "space-y-6 bg-card p-8 rounded-2xl border border-border shadow-lg",
              shake ? "animate-shake" : ""
            )}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-blue flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                E
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    {...form.register("email")}
                    placeholder="admin@edarcon.com"
                    className="pl-10"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="w-4 h-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                />
                <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                  Remember me
                </label>
              </div>
              <Button
                type="submit"
                className="w-full btn-primary-accent text-white font-semibold text-sm py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Demo credentials
              </h3>
              <div className="space-y-2">
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    onClick={() => fillCredentials(c.email, c.password)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted hover:text-foreground transition-colors text-left"
                  >
                    <div>
                      <span className="text-xs text-muted-foreground block">{c.email}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{c.password}</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-blue capitalize">
                      {c.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
              Prototype — mock auth. Real auth (Supabase / Auth.js) replaces this in production.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
