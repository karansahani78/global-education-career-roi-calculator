import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Calculator', href: '/calculator' },
  { label: 'Compare', href: '/compare' },
  { label: 'Countries', href: '/countries' },
  { label: 'Majors', href: '/majors' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container flex h-[70px] items-center justify-between gap-4 md:h-[88px]">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="EduROI home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
            <GraduationCap className="h-[17px] w-[17px]" aria-hidden="true" />
          </span>
          <span className="font-heading text-[19px] font-semibold tracking-[-0.04em] text-foreground">
            EduROI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-[13px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle className="ml-1" />
          <Button asChild size="sm" className="ml-1">
            <Link to="/calculator">Start analysis</Link>
          </Button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.div
          id="mobile-navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
          className="border-t border-border bg-background md:hidden"
        >
          <nav className="container flex flex-col gap-1 py-4" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-1 py-2.5 text-sm font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button asChild className="mt-3 w-full">
              <Link to="/calculator" onClick={() => setMobileOpen(false)}>
                Start analysis
              </Link>
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
}
