FROM node:20-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖配置（加 * 号防止本地没有 lock 文件时报错）
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# 复制所有源代码并构建
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Next.js 在 build 时会预渲染并实例化 OpenAI 客户端，需要提供一个假的 Key 防止报错
ENV AI_API_KEY="dummy_key_for_build"
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# 如果有 next.config.ts 也会被项目读取
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
