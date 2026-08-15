import Link from "next/link";

// Placeholder hrefs — point these at your real profiles.
const links = [
  { label: "Instagram", href: "https://www.instagram.com/__a.k.a_saubhik__?igsh=azg2ejRvYWVqcnll" },
  { label: "YouTube", href: "#" },
];

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-3 text-xs text-white/70">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="transition-colors hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
