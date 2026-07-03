import { useEffect } from "react";

const SITE_URL = "https://swelt.partner";
const SITE_NAME = "Swelt";

interface SeoProps {
  /** Page title without the brand suffix — " | Swelt" is appended automatically. */
  title: string;
  description: string;
  /** Path starting with "/" (e.g. "/shop"). Used for canonical + og:url. */
  path: string;
  /** Set true on private/admin pages to keep them out of the index. */
  noindex?: boolean;
  /** Optional page-level JSON-LD structured data (GEO/AEO). */
  jsonLd?: object | object[];
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Central head manager — one component, identical behavior on every page.
 * Sets title, description, canonical, robots, Open Graph/Twitter and JSON-LD.
 */
export function Seo({ title, description, path, noindex = false, jsonLd }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    schemas.forEach((schema, i) => {
      const id = `ld-json-seo-${i}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    });

    return () => {
      schemas.forEach((_, i) => document.getElementById(`ld-json-seo-${i}`)?.remove());
    };
  }, [title, description, path, noindex, jsonLd]);

  return null;
}
