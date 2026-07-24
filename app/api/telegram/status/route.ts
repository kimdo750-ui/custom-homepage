import { NextResponse } from 'next/server';

// 봇 상태 추적 (간단한 메모리 기반)
let botStatus = {
  running: false,
  startedAt: null as Date | null,
  lastActivity: null as Date | null,
  messagesProcessed: 0,
};

export function markBotStarted() {
  botStatus.running = true;
  botStatus.startedAt = new Date();
  botStatus.lastActivity = new Date();
}

export function recordActivity() {
  botStatus.lastActivity = new Date();
  botStatus.messagesProcessed++;
}

export async function GET() {
  const uptime = botStatus.startedAt
    ? Math.floor((Date.now() - botStatus.startedAt.getTime()) / 1000)
    : 0;

  return NextResponse.json({
    status: botStatus.running ? 'running' : 'stopped',
    startedAt: botStatus.startedAt?.toISOString(),
    lastActivity: botStatus.lastActivity?.toISOString(),
    uptimeSeconds: uptime,
    messagesProcessed: botStatus.messagesProcessed,
    token: process.env.TELEGRAM_BOT_TOKEN ? '✅ 설정됨' : '❌ 없음',
  });
}
