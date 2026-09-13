// Best-effort admin alerting for unexpected server errors on critical paths (payment, refund,
// webhook reconciliation) — reuses the same Telegram bot already wired up for booking
// notifications, so there's no new account/service to set up. Never throws: an alert failing
// to send must never turn into a second error on top of the one being reported.
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export async function alertAdminError(context: string, error: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const message = error instanceof Error ? error.message : String(error);
  const text = [
    `🚨 <b>Server error — ${escapeHtml(context)}</b>`,
    `<blockquote>${escapeHtml(message).slice(0, 500)}</blockquote>`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch(() => {});
}
