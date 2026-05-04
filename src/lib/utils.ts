import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the correct full URL for an asset.
 * If the path is relative and starts with /uploads, it prefixes it with the API base URL.
 * Static assets in the public folder (starting with /images) are returned as is.
 */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  
  // If it's already a full URL (http/https), return it
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  // For /uploads/ paths (dynamic assets from server)
  if (path.startsWith("/uploads/")) {
    // In production, the frontend and backend are usually on the same domain,
    // so a relative path /uploads/ is correct for the browser.
    // However, during development with Vite proxy, or if API is on a different domain,
    // we might need to prefix it.
    
    const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || "";
    // Remove /api suffix if present in the base URL for asset serving
    const base = apiBase.replace(/\/api\/?$/, "");
    
    return `${base}${path}`;
  }

  // Default for static assets in /public (like /images/...)
  return path;
}
