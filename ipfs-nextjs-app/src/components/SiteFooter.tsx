import Link from "next/link";

const productLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload", label: "Upload File" },
  { href: "/download", label: "Download File" },
  { href: "/features", label: "Features" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/security", label: "Security" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-blue-500"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-2xl font-bold text-white">BLOCKSTORE</span>
            </div>

            <p className="mb-6 max-w-md text-gray-400">
              Secure, decentralized file storage powered by end-to-end encryption and blockchain
              verification.
            </p>

            <p className="text-sm text-gray-500">(c) 2026 BLOCKSTORE. All rights reserved.</p>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Product</h3>
            <ul className="space-y-4">
              {productLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Company</h3>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 font-semibold text-white">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 text-sm md:flex-row">
          <div className="flex flex-wrap justify-center gap-6 md:justify-start">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/cookies" className="transition hover:text-white">
              Cookies
            </Link>
            <Link href="/security" className="transition hover:text-white">
              Security
            </Link>
          </div>

          <div className="text-gray-500">Made with decentralization in mind - Hyderabad, India</div>
        </div>
      </div>
    </footer>
  );
}
