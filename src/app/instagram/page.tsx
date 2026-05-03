import { redirect } from "next/navigation";

export default function InstagramRedirect({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const lang = typeof searchParams.lang === "string" ? searchParams.lang : undefined;
  redirect(lang ? `/?lang=${lang}` : "/");
}
