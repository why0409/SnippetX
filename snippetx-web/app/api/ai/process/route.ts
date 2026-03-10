import OpenAI from "openai";
import { NextResponse } from "next/server";
import Redis from "ioredis";

// 初始化 Redis 客户端 (默认连接 127.0.0.1:6379)
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
  baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com",
});

export async function POST(request: Request) {
  const { code, action = "format" } = await request.json();
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "请先登录以使用 AI 功能" }, { status: 401 });
  }

  // 频率限制：使用 Redis 原子计数器
  const userToken = authHeader.split(" ")[1];
  const rateLimitKey = `rate:ai:${userToken.substring(0, 20)}`; // 取 Token 前段作为 Key
  
  try {
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, 60); // 首次访问设置 60s 过期
    }
    
    if (currentCount > 3) {
      return NextResponse.json({ 
        message: "AI 操作太频繁了", 
        details: "为了防止资源滥用，每分钟限 3 次，请稍后再试。" 
      }, { status: 429 });
    }
  } catch (redisError) {
    console.warn("Redis rate limit failed, falling back to allow.", redisError);
  }

  if (!code) return NextResponse.json({ message: "代码内容不能为空" }, { status: 400 });
  if (!process.env.AI_API_KEY) return NextResponse.json({ message: "服务器 AI 未配置" }, { status: 500 });

  const prompts = {
    format: `Analyze the code and provide results in XML tags for safe parsing.
              1. <language>: detected language lowercase.
              2. <summary>: brief one-sentence Chinese summary.
              Return ONLY these XML tags.`,
    insight: `You are a Senior Engineer. Analyze this code and provide:
              1. <explanation>: A deep but brief logical breakdown in Chinese.
              2. <suggestions>: 3 bullet points for performance or clean code improvements in Chinese.
              Return ONLY these XML tags.`
  };

  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: (prompts as any)[action] || prompts.format },
        { role: "user", content: code }
      ],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content || "";
    const extract = (tag: string) => {
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
      return content.match(regex)?.[1]?.trim() || "";
    };

    if (action === "insight") {
      return NextResponse.json({
        explanation: extract("explanation"),
        suggestions: extract("suggestions")
      });
    }

    return NextResponse.json({
      language: extract("language"),
      description: extract("summary")
    });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ message: "AI 分析失败", details: error.message }, { status: 500 });
  }
}
