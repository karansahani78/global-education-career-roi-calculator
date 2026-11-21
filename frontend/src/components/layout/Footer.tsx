import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight } from 'lucide-react';

const LINK_CLASS =
  'footer-link text-[13px] leading-none text-[#b2bbc7] transition-colors hover:text-white';
const HEADING_CLASS =
  'mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#8b95a5]';

export function Footer() {
  return (
    <footer className="bg-ink text-[#e9edf1]">
      <div className="container pb-8 pt-14 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="EduROI home">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-heading text-[19px] font-semibold tracking-[-0.04em] text-white">
                EduROI
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#b2bbc7]">
              Make smarter education investment decisions with data-driven ROI analysis.
            </p>
            <Link
              to="/calculator"
              className="footer-link mt-6 text-[13px] font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white"
            >
              Start your analysis
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h2 className={HEADING_CLASS}>Tools</h2>
            <nav className="flex flex-col gap-3.5" aria-label="Tools">
              <Link to="/calculator" className={LINK_CLASS}>ROI calculator</Link>
              <Link to="/compare" className={LINK_CLASS}>Compare programs</Link>
            </nav>
          </div>

          <div>
            <h2 className={HEADING_CLASS}>Explore</h2>
            <nav className="flex flex-col gap-3.5" aria-label="Explore">
              <Link to="/countries" className={LINK_CLASS}>Countries</Link>
              <Link to="/majors" className={LINK_CLASS}>Majors</Link>
              <Link to="/blog" className={LINK_CLASS}>Insights</Link>
            </nav>
          </div>

          <div>
            <h2 className={HEADING_CLASS}>Legal</h2>
            <nav className="flex flex-col gap-3.5" aria-label="Legal">
              <Link to="/privacy-policy" className={LINK_CLASS}>Privacy policy</Link>
              <Link to="/terms-of-service" className={LINK_CLASS}>Terms of service</Link>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] text-[#8b95a5] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EduROI. All rights reserved.</p>
          <p>For informational purposes only. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
