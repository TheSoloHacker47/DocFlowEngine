'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        name,
        href: currentPath,
        current: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="inline-flex items-center">
            {index > 0 && (
              <span 
                className="text-gray-400 mx-1" 
                aria-hidden="true"
              >
                /
              </span>
            )}
            
            {item.current ? (
              <span 
                className="text-sm font-medium text-gray-500 dark:text-gray-400"
                aria-current="page"
              >
                {index === 0 && (
                  <span className="mr-1" aria-hidden="true">🏠</span>
                )}
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                {index === 0 && (
                  <span className="mr-1" aria-hidden="true">🏠</span>
                )}
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

// Predefined breadcrumb configurations for common pages
export const pageBreadcrumbs = {
  about: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about', current: true }
  ],
  contact: [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/contact', current: true }
  ],
  'how-to-use': [
    { name: 'Home', href: '/' },
    { name: 'How to Use', href: '/how-to-use', current: true }
  ],
  'privacy-policy': [
    { name: 'Home', href: '/' },
    { name: 'Privacy Policy', href: '/privacy-policy', current: true }
  ],
  'terms-of-service': [
    { name: 'Home', href: '/' },
    { name: 'Terms of Service', href: '/terms-of-service', current: true }
  ]
}; 