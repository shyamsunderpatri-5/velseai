import Link from 'next/link';

export { Link };

export function usePathname(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return (window.location.pathname) || '';
}

type Router = {
  push: (path: string) => void;
  replace: (path: string) => void;
  pathname: string;
};

export function useRouter(): Router {
  const pathname = usePathname();
  
  const getLocale = (): string => {
    const parts = pathname.split('/');
    return parts[1] || 'en';
  };
  
  const push = (path: string) => {
    const locale = getLocale();
    if (!path.startsWith(`/${locale}`) && !path.startsWith('http')) {
      const finalPath = path.startsWith('/') ? path : `/${path}`;
      window.location.href = `/${locale}${finalPath}`;
    } else {
      window.location.href = path;
    }
  };
  
  const replace = (path: string) => {
    const locale = getLocale();
    if (!path.startsWith(`/${locale}`) && !path.startsWith('http')) {
      const finalPath = path.startsWith('/') ? path : `/${path}`;
      window.location.replace(`/${locale}${finalPath}`);
    } else {
      window.location.replace(path);
    }
  };
  
  return { push, replace, pathname };
}