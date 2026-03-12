"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import axios from "axios";
import { X, Code2, Tag, Info, Pin, Globe, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any; // 如果有数据则进入编辑模式
}

const LANGUAGES = ["swift", "java", "python", "javascript", "typescript", "cpp", "html", "css", "sql", "go", "rust", "shell"];

export default function CreateSnippetModal({ isOpen, onClose, onSuccess, editData }: CreateSnippetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    language: "javascript",
    category: "",
    description: "",
    isPublic: false,
    isPinned: false,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || "",
        content: editData.content || "",
        language: editData.language || "javascript",
        category: editData.category || "",
        description: editData.description || "",
        isPublic: editData.isPublic || false,
        isPinned: editData.isPinned || false,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        language: "javascript",
        category: "",
        description: "",
        isPublic: false,
        isPinned: false,
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editData) {
        await api.put(`/snippet/${editData.id}`, formData);
      } else {
        await api.post("/snippet", formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "保存失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const handleAiOptimize = async () => {
    // 检查是否登录 (这里需要通过外部传入 isLoggedIn 或读取 localStorage)
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("请先登录以使用 AI 功能");
      return;
    }

    const originalContent = formData.content;
    if (!originalContent) return;
    
    setIsAiProcessing(true);
    setError("");

    try {
      const res = await axios.post("/api/ai/process", 
        { code: originalContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { language, description } = res.data;
      
      setFormData(prev => ({
        ...prev,
        language: (language && LANGUAGES.includes(language.toLowerCase())) ? language.toLowerCase() : prev.language,
        description: description || prev.description
      }));
    } catch (err: any) {
      const details = err.response?.data?.details || err.message || "";
      setError(`AI 分析失败: ${details}`);
    } finally {
      setIsAiProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-[#161b22] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <header className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1c2128]">
            <div>
              <h2 className="text-2xl font-black">{editData ? "编辑代码片段" : "保存新片段"}</h2>
              <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Workspace / Snippets</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} className="text-gray-400" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 标题 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter ml-1">Snippet Title</label>
                <div className="relative">
                  <Info className="absolute left-4 top-3.5 text-gray-600" size={18} />
                  <input
                    type="text"
                    placeholder="例如: JWT 解析工具类"
                    required
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              {/* 分类 */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-500 uppercase tracking-tighter ml-1">Category / Tag</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 text-gray-600" size={18} />
                  <input
                    type="text"
                    placeholder="例如: Utils, Auth, Algorithm"
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 代码内容 */}
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Source Code</label>
                  <button 
                    type="button"
                    onClick={handleAiOptimize}
                    disabled={isAiProcessing || !formData.content}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isAiProcessing ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 active:scale-95'}`}
                  >
                    {isAiProcessing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isAiProcessing ? "AI 分析中..." : "AI 智能优化"}
                  </button>
                </div>
                <select 
                  className="bg-gray-800 text-[10px] font-bold px-3 py-1 rounded-md border-none focus:ring-0 cursor-pointer uppercase"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div className="relative group">
                <Code2 className="absolute right-4 top-4 text-gray-700 group-focus-within:text-green-500 transition-colors" size={20} />
                <textarea
                  required
                  rows={12}
                  placeholder="粘贴你的代码到这里..."
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-3xl p-6 text-sm font-mono focus:outline-none focus:border-green-500/50 transition-all shadow-inner leading-relaxed resize-none custom-scrollbar"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>

            {/* 描述与选项 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter ml-1">Notes / Description</label>
                <textarea
                  rows={3}
                  placeholder="添加一点备注信息..."
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-gray-600 transition-all shadow-inner resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-2xl border border-gray-800 shadow-inner">
                  <div className="flex items-center gap-3">
                    <Pin size={18} className={formData.isPinned ? "text-orange-400" : "text-gray-600"} />
                    <span className="text-sm font-bold">置顶此片段</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isPinned ? 'bg-orange-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPinned ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-2xl border border-gray-800 shadow-inner">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className={formData.isPublic ? "text-green-400" : "text-gray-600"} />
                    <span className="text-sm font-bold">公开分享</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.isPublic ? 'bg-green-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPublic ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs italic text-center font-bold">{error}</p>}
          </form>

          <footer className="p-8 border-t border-gray-800 bg-[#1c2128] flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (editData ? "保存修改" : "立即创建")}
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
