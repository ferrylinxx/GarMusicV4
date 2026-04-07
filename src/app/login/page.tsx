"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music2, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError("Email o contraseña incorrectos");
    else { router.push("/"); router.refresh(); }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 animate-fade-in">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-green-500/30">
            <Music2 size={30} className="text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Bienvenido</h1>
          <p className="text-white/40 text-sm mt-1">Inicia sesión en GarMusic</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="tu@email.com" autoComplete="email"
              className="w-full bg-white/5 text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none focus:bg-white/8 placeholder:text-white/20 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs font-semibold mb-1.5 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" autoComplete="current-password"
                className="w-full bg-white/5 text-white px-4 py-3.5 pr-11 rounded-xl border border-white/10 focus:border-green-500/50 focus:outline-none focus:bg-white/8 placeholder:text-white/20 text-sm transition-all"
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-500 text-black font-bold py-3.5 rounded-xl hover:bg-green-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
