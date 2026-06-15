export interface ProjectAction {
  label: string;
  href: string;
}

export interface Project {
  name: string;
  logo: string;
  date: string;
  subtitle: string;
  actions: ProjectAction[];
  logoClassName?: string;
}

export const projects: Project[] = [
  {
    name: "Evict",
    logo: "https://r2.azron.net/evict-rebrand.jpg",
    date: "Aug 2024 - present",
    subtitle:
      "The all-in-one solution for seamless server management — powerful, polished, and visually refined.",
    actions: [{ label: "website", href: "https://evict.bot" }],
  },
  {
    name: "Azron, LLC",
    logo: "https://r2.azron.net/azron.png",
    date: "Aug 2025 - present",
    subtitle:
      "Registered software company providing high-quality development services and products to clients worldwide.",
    actions: [{ label: "website", href: "https://azron.net" }],
    logoClassName: "invert brightness-200",
  },
];
