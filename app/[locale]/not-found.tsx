import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl text-foreground">{t("title")}</h1>
      <p className="mt-2 max-w-md text-muted">{t("description")}</p>
      <Link
        href="/"
        className="focus-ring mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#07080c]"
      >
        {t("home")}
      </Link>
    </div>
  );
}
