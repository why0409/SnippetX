"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { X, Mail, Lock, User, Loader2, SendHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    code: ""
  });

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const [isSendingCode, setIsSendingCode] = useState(false);

  const sendCode = async () => {
    if (!formData.email) { setError("请先输入邮箱"); return; }
    setIsSendingCode(true);
    setError("");
    try {
      await api.post(`/user/send-code?email=${formData.email}`);
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "验证码发送失败");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode !== 'login' && formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        await api.post(`/user/register?code=${formData.code}`, {
          username: formData.username,
          password: formData.password,
          email: formData.email
        });
        const res = await api.post("/user/login", { username: formData.username, password: formData.password });
        localStorage.setItem("auth_token", res.data.data);
      } else if (mode === 'forgot') {
        await api.post(`/user/reset-password?email=${formData.email}&code=${formData.code}&newPassword=${formData.password}`);
        setAuthMode('login');
        setError("");
        alert("密码已重置，请登录");
        setLoading(false);
        return;
      } else {
        const res = await api.post("/user/login", { username: formData.username, password: formData.password });
        localStorage.setItem("auth_token", res.data.data);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#161b22] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <button onClick={onClose} className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>

          <div className="p-10">
            <header className="mb-8 text-center">
              <h2 className="text-3xl font-black mb-2 tracking-tight">
                {mode === 'register' ? "加入 SnippetX" : mode === 'forgot' ? "重置密码" : "欢迎回来"}
              </h2>
              <p className="text-gray-500 text-sm">
                {mode === 'register' ? "验证邮箱以开启高效代码同步" : mode === 'forgot' ? "我们将向您的邮箱发送验证码" : "继续你的代码管理之旅"}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode !== 'forgot' && (
                <div className="relative group">
                  <User className="absolute left-4 top-[1.1rem] text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="text" placeholder={mode === 'login' ? "用户名 / 邮箱" : "用户名"} required className="auth-input w-full pl-12 pr-4" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
              )}

              {mode !== 'login' && (
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <Mail className="absolute left-4 top-[1.1rem] text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input type="email" placeholder="邮箱地址" required className="auth-input w-full pl-12 pr-4" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <button type="button" disabled={countdown > 0 || isSendingCode} onClick={sendCode} className={`px-4 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${countdown > 0 || isSendingCode ? 'bg-gray-800 text-gray-500' : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'}`}>
                    {isSendingCode ? <Loader2 className="animate-spin" size={12} /> : (countdown > 0 ? `${countdown}s` : "获取验证码")}
                  </button>
                </div>
              )}

              {mode !== 'login' && (
                <div className="relative group">
                  <SendHorizontal className="absolute left-4 top-[1.1rem] text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="text" placeholder="6 位验证码" required className="auth-input w-full pl-12 pr-4" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
              )}

              <div className="relative group">
                <Lock className="absolute left-4 top-[1.1rem] text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type="password" placeholder={mode === 'forgot' ? "新密码" : "密码"} required className="auth-input w-full pl-12 pr-4" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              {mode !== 'login' && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-[1.1rem] text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="password" placeholder="确认密码" required className="auth-input w-full pl-12 pr-4" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                </div>
              )}

              {error && <p className="text-red-400 text-xs font-medium pl-2 italic">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'register' ? "立即注册" : mode === 'forgot' ? "确认修改" : "登录系统")}
              </button>
            </form>

            <footer className="mt-8 flex flex-col gap-3 text-center">
              <button onClick={() => { setAuthMode(mode === 'login' ? 'register' : 'login'); setError(""); }} className="text-gray-400 text-sm hover:text-blue-400 transition-colors">
                {mode === 'login' ? "还没有账号？加入社区" : "回到登录"}
              </button>
              {mode === 'login' && (
                <button onClick={() => { setAuthMode('forgot'); setError(""); }} className="text-gray-500 text-xs hover:text-white transition-colors">
                  忘记密码？
                </button>
              )}
            </footer>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
