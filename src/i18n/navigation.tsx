"use client";

import NextLink, { LinkProps } from 'next/link';
import React, { forwardRef } from 'react';
import { usePathname as useNextPathname, useParams } from 'next/navigation';
import { locales, type Locale, defaultLocale } from './config';

/**
 * Custom hook to get the clean pathname without the locale prefix.
 * Works safely on both server and client.
 */
export function usePathname(): string {
  const pathname = useNextPathname();
  if (!pathname) return '';

  const parts = pathname.split('/');
  if (parts[1] && locales.includes(parts[1] as Locale)) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

/**
 * Custom router with locale-aware navigation.
 */
export function useRouter() {
  const pathname = useNextPathname();
  const params = useParams();
  
  const currentLocale = (params?.locale as string) || defaultLocale;

  const getFullUrl = (path: string, locale?: string) => {
    if (path.startsWith('http')) return path;
    const finalPath = path.startsWith('/') ? path : `/${path}`;
    const targetLocale = locale || currentLocale;
    
    // Clean segment and join
    const cleanPath = finalPath.replace(/^\/[a-z]{2}(\/|$)/, '/');
    return `/${targetLocale}${cleanPath}`.replace(/\/+$/, '') || '/';
  };

  return {
    push: (path: string, locale?: string) => {
      window.location.href = getFullUrl(path, locale);
    },
    replace: (path: string, locale?: string) => {
      window.location.replace(getFullUrl(path, locale));
    },
    refresh: () => window.location.reload(),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
  };
}

/**
 * Localized Link component that automatically handles locale prefixes.
 * Eliminates Hydration Mismatches by using Next.js native hooks.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps & { children: React.ReactNode; className?: string; locale?: string }>(
  ({ href, locale, ...props }, ref) => {
    const params = useParams();
    const detectedLocale = (params?.locale as string) || defaultLocale;
    
    const finalLocale = locale || detectedLocale;
    const hrefString = typeof href === 'string' ? href : (href as any).pathname || '';
    
    if (hrefString.startsWith('http')) {
      return <NextLink href={href} {...props} ref={ref} />;
    }

    const cleanPath = hrefString.startsWith('/') ? hrefString : `/${hrefString}`;
    const finalHref = `/${finalLocale}${cleanPath}`.replace(/\/+$/, '') || '/';
    
    return <NextLink href={finalHref} {...props} ref={ref} />;
  }
);

Link.displayName = 'LocalizedLink';