import { MetadataRoute } from "next";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://velseai.com";
  const pages = ["", "/ats-checker", "/pricing"];
  
  return pages.flatMap(page =>
    locales.flatMap(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "weekly" : "monthly",
      priority: page === "" ? 1 : page === "/ats-checker" ? 0.9 : 0.8
    }))
  );
}