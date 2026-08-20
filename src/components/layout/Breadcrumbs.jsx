import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  '': 'Dashboard',
  'inquiries': 'Inquiries',
  'quotes': 'Quotes',
  'careers': 'Careers',
  'freelance': 'Freelance',
  'services': 'Services',
  'team': 'Team',
  'testimonials': 'Reviews',
  'faqs': 'FAQs',
  'settings': 'Settings',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
      <Link
        to="/"
        className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {pathSegments.length === 0 ? (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold">Dashboard</span>
        </>
      ) : (
        pathSegments.map((segment, idx) => {
          const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
          const isLast = idx === pathSegments.length - 1;
          const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={path}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              {isLast ? (
                <span className="text-cyan-400 font-semibold">{label}</span>
              ) : (
                <Link to={path} className="hover:text-cyan-400 transition-colors">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })
      )}
    </nav>
  );
}
