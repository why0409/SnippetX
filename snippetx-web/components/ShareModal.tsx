"use client";

import { useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { X, Download, Camera, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as htmlToImage from 'html-to-image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippet: any;
}

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
  "linear-gradient(135deg, #2af598 0%, #009efd 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
];

export default function ShareModal({ isOpen, onClose, snippet }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [loading, setLoading] = useState(false);

  const downloadImage = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `snippet-${snippet.title}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl bg-[#161b22] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-auto"
        >
          {/* 左侧预览区 */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0d1117] flex items-center justify-center">
            <div 
              ref={cardRef}
              style={{ background: gradient }}
              className="p-12 rounded-lg shadow-2xl min-w-[300px] md:min-w-[600px]"
            >
              <div className="bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-white/10">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex gap-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-4 text-[10px] font-mono opacity-40 uppercase tracking-tighter text-white">{snippet.language}</span>
                </div>
                <div className="p-6">
                  <SyntaxHighlighter
                    language={snippet.language.toLowerCase()}
                    style={atomDark}
                    customStyle={{ background: "transparent", fontSize: "14px", margin: 0, padding: 0 }}
                  >
                    {snippet.content}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧控制区 */}
          <div className="w-full md:w-80 border-l border-gray-800 p-8 flex flex-col gap-8 bg-[#161b22]">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl uppercase tracking-widest text-blue-500">Share Card</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Background Gradient</label>
              <div className="grid grid-cols-5 gap-3">
                {GRADIENTS.map((g, i) => (
                  <button 
                    key={i} 
                    onClick={() => setGradient(g)}
                    style={{ background: g }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${gradient === g ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-3">
              <button 
                onClick={downloadImage}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
              >
                {loading ? <Camera className="animate-pulse" /> : <Download size={20} />}
                {loading ? "GENERATING..." : "DOWNLOAD PNG"}
              </button>
              <p className="text-[10px] text-gray-500 text-center font-medium leading-relaxed">
                Rendered with 2x scale for high quality sharing.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
