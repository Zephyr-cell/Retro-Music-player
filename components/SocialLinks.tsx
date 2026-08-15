import Link from "next/link";

const links = [
  {
    label: "Instagram",
    profiles: [
      { name: "Saubhik Datta", href: "https://www.instagram.com/__a.k.a_saubhik__" },
      { name: "Om Roy", href: "https://www.instagram.com/omm__4u" },
    ],
  },
  {
    label: "Twitter",
    href: "https://twitter.com/@Sarcastiqmonc",
  },
  {
    label: "LinkedIn",
    profiles: [
      { name: "Saubhik Datta", href: "https://www.linkedin.com/in/saubhik-dutta-528937367" },
      { name: "Om Roy", href: "www.linkedin.com/in/om-kumar-roy-707a31323" },
    ],
  },
];

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-9 text-xs text-white/90">
      {links.map((item) =>
        item.profiles ? (
          // Dropdown for links with multiple collaborator profiles
          <div key={item.label} className="relative group py-1 cursor-pointer">
            <span className="flex items-center gap-3 transition-colors group-hover:text-white">
              {item.label}
              <svg
                className="w-8 h-3 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>

            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full hidden group-hover:flex flex-col gap-1.5 rounded-md bg-zinc-900/90 backdrop-blur-md border border-white/10 p-2.5 shadow-xl text-xs min-w-[100px] z-50">
              {item.profiles.map((profile) => (
                <Link
                  key={profile.name}
                  href={profile.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {profile.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // Regular single link
          <Link
            key={item.label}
            href={item.href!}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        )
      )}
    </div>
  );
}