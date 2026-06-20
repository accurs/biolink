import LanyardStatus from "./components/LanyardStatus";
import TechIcon from "./components/TechIcon";
import { links } from "./data/links";
import { projects } from "./data/projects";
import { tech } from "./data/tech";
import { FiArrowUpRight } from "react-icons/fi";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-16">

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8">

        <section className="fade-in-up flex flex-col items-center text-center">
          <h1 className="heading-font avatar-gradient-text text-5xl font-bold tracking-tight sm:text-6xl">
            vael
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">
            passionate developer creating products used by millions of users and thousands of guilds.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>

        <section className="fade-in-up delay-2 w-full">
          <LanyardStatus userId="604463848526708757" />
        </section>

        <section className="fade-in-up delay-3 w-full">
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.actions[0]?.href}
                target="_blank"
                rel="noreferrer"
                className="glass-card group flex flex-col gap-3 p-4 transition-all hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40 p-1">
                    <img
                      src={project.logo}
                      alt=""
                      className={`h-full w-full rounded-sm object-contain ${project.logoClassName ?? ""}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100">{project.name}</p>
                    <p className="text-[11px] text-zinc-500">{project.date}</p>
                  </div>
                  <FiArrowUpRight className="ml-auto h-4 w-4 flex-shrink-0 text-zinc-600 transition-all group-hover:text-zinc-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">{project.subtitle}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="fade-in-up delay-4 w-full marquee-wrap">
          <div className="marquee-track">
            {[...tech, ...tech].map((tool, index) => (
              <a
                key={`${tool.label}-${index}`}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="glass-pill gap-1.5 text-[11px] lowercase text-zinc-500 hover:text-zinc-300"
              >
                <TechIcon name={tool.label} />
                {tool.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="fade-in-up delay-4 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-zinc-500">
            <a href="mailto:damon@azron.net" className="transition-colors hover:text-zinc-300 underline underline-offset-4 decoration-zinc-700">damon@azron.net</a>
          </p>
          <a
            href="https://github.com/accurs/portfolio"
            target="_blank"
            rel="noreferrer"
            className="glass-pill inline-flex items-center gap-1.5 text-[11px] lowercase text-zinc-500 hover:text-zinc-300"
          >
            source
            <FiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <p className="text-[11px] text-zinc-600" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://azron.net"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              azron.net
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
