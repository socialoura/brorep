import { NextRequest, NextResponse } from "next/server";
import { getDueEmails, markEmailSent } from "@/lib/db";
import { sendFollowUpEmail } from "@/lib/email-sequences";

// Called by a cron job (e.g. Vercel Cron, or external like cron-job.org)
// GET /api/cron/emails?secret=YOUR_CRON_SECRET
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueEmails = await getDueEmails();
    let sent = 0;
    let failed = 0;

    for (const row of dueEmails) {
      const success = await sendFollowUpEmail({
        id: row.id,
        email: row.email,
        username: row.username,
        platform: row.platform,
        template: row.template,
      });

      if (success) {
        await markEmailSent(row.id);
        sent++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({
      processed: dueEmails.length,
      sent,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Cron email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
