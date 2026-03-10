"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Search, Plus, Pin, Globe, User, LogOut, 
  ChevronRight, Copy, Check, Pencil, Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SnippetX() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
      fetchUser();
    }
    fetchSnippets();
  }, []);

  const fetchSnippets = async (category?: string | null, keyword?: string) => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (keyword) params.keyword = keyword;
      const res = await api.get("/snippet/list", { params });
      setSnippets(res.data.data);
      if (res.data.data.length > 0 && !selectedSnippet) {
        setSelectedSnippet(res.data.data[0]);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data.data);
      const catRes = await api.get("/snippet/categories");
      setCategories(catRes.data.data);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setUser(null);
    setSelectedSnippet(null);
    fetchSnippets();
  };

  return (
    <div className="flex h-screen bg-[#0f1117] text-gray-100 font-sans overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-80 border-r border-gray-800 flex flex-col bg-[#161b22]/50 backdrop-blur-xl">
        <header className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            SnippetX
          </h1>
          {isLoggedIn ? (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} />
            </button>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 bg-gray-800 rounded-full hover:bg-gray-700 transition-all"
            >
              登录
            </button>
          )}
        </header>

        {/* 搜索栏 */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="快速搜索代码..."
              className="w-full bg-[#0d1117] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all shadow-inner"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                fetchSnippets(selectedCategory, e.target.value);
              }}
            />
          </div>
        </div>

        {/* 分类过滤器 */}
        {isLoggedIn && categories.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => { setSelectedCategory(null); fetchSnippets(null, searchText); }}
              className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap transition-all ${!selectedCategory ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'}`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => { setSelectedCategory(cat); fetchSnippets(cat, searchText); }}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600' : 'bg-gray-800 text-gray-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {snippets.map(s => (
            <motion.div
              layout
              key={s.id}
              onClick={() => setSelectedSnippet(s)}
              className={`p-4 rounded-xl cursor-pointer transition-all relative group ${selectedSnippet?.id === s.id ? 'bg-blue-600/10 border border-blue-500/30 shadow-lg shadow-blue-900/10' : 'hover:bg-gray-800/50 border border-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold truncate pr-4">{s.title}</h3>
                {s.isPinned && <Pin size={12} className="text-orange-400" />}
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded capitalize">
                  {s.language}
                </span>
                {s.isPublic && <Globe size={10} className="text-green-500" />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 用户底部栏 */}
        {isLoggedIn && user && (
          <footer className="p-4 border-t border-gray-800 bg-[#0d1117]/80 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-bold">{user.username}</p>
                  <p className="text-gray-500 italic">Snippet Pro</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          </footer>
        )}
      </aside>

      {/* 内容区 */}
      <main className="flex-1 flex flex-col bg-[#0d1117]">
        {selectedSnippet ? (
          <>
            <header className="p-8 pb-4 flex justify-between items-end">
              <div>
                <p className="text-xs font-mono text-blue-500 uppercase tracking-widest mb-2">
                  {selectedSnippet.language}
                </p>
                <h2 className="text-3xl font-black">{selectedSnippet.title}</h2>
              </div>
              <div className="flex gap-3">
                <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all" title="复制内容">
                  <Copy size={20} />
                </button>
                {isLoggedIn && (
                  <>
                    <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all text-blue-400">
                      <Pencil size={20} />
                    </button>
                    <button className="p-3 bg-gray-800 hover:bg-red-900/30 rounded-xl transition-all text-red-500">
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </header>

            <div className="flex-1 p-8 pt-4 overflow-hidden flex flex-col">
              <div className="flex-1 rounded-2xl overflow-hidden border border-gray-800 bg-[#161b22] shadow-2xl flex flex-col">
                <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800 flex gap-1.5 items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-4 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Code Editor</span>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar p-2">
                  <SyntaxHighlighter
                    language={selectedSnippet.language.toLowerCase()}
                    style={atomDark}
                    customStyle={{ background: "transparent", fontSize: "14px" }}
                    showLineNumbers
                  >
                    {selectedSnippet.content}
                  </SyntaxHighlighter>
                </div>
              </div>
              
              {selectedSnippet.description && (
                <div className="mt-6 p-6 bg-blue-600/5 border-l-4 border-blue-500 rounded-r-xl">
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">💡 备注信息</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{selectedSnippet.description}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-20">
            <Plus size={100} strokeWidth={1} />
            <p className="mt-4 font-black tracking-[0.2em]">SELECT OR CREATE A SNIPPET</p>
          </div>
        )}
      </main>

      {/* 简单的登录弹窗 Placeholder */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6">欢迎加入 SnippetX</h2>
            <p className="text-sm text-gray-400 mb-8">目前请直接在后端注册账号后通过本地存储模拟登录，或告诉我帮你实现这里的 UI。</p>
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold"
            >
              明白
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
