import LanyardStatus from "./components/LanyardStatus";
import TechIcon from "./components/TechIcon";
import { links } from "./data/links";
import { projects } from "./data/projects";
import { tech } from "./data/tech";
import { FiArrowUpRight, FiChevronDown } from "react-icons/fi";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-12">

      <div className="relative z-10 flex w-full max-w-xl flex-col gap-5">
        <section className="fade-in-up">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="heading-font text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
                vael
              </h1>
              <p className="mt-1 text-sm lowercase text-zinc-300">
                Passionate developer creating products used by millions of users and thousands of guilds.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-pill gap-1.5 text-xs lowercase text-zinc-300"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </section>

        <LanyardStatus userId="604463848526708757" />

        <section className="fade-in-up delay-2">
          <ul className="space-y-2.5">
            {projects.map((project) => (
              <li key={project.name}>
                <details className="glass-card group overflow-hidden" open>
                  <summary className="cursor-pointer list-none px-3 py-2.5 sm:px-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/30 p-0.5">
                          <img
                            src={project.logo}
                            alt=""
                            className={`h-full w-full rounded-sm object-contain ${project.logoClassName ?? ""}`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-100">
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                          {project.date}
                        </span>
                        <FiChevronDown
                          className="h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </summary>

                  <div className="border-t border-white/10 px-3 py-3 sm:px-3.5">
                    <p className="text-xs leading-relaxed text-zinc-400">{project.subtitle}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.actions.map((action) => (
                        <a
                          key={action.label}
                          href={action.href}
                          target="_blank"
                          rel="noreferrer"
                          className="glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs lowercase text-zinc-300"
                        >
                          <FiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          {action.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section className="fade-in-up delay-3 glass-card p-3">
          <p className="text-xs text-zinc-400">
            you can contact me at <a href="mailto:damon@azron.net" className="underline underline-offset-4">damon@azron.net</a>
          </p>
        </section>

        <section className="fade-in-up delay-4 marquee-wrap">
          <div className="marquee-track">
            {[...tech, ...tech].map((tool, index) => (
              <a
                key={`${tool.label}-${index}`}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="glass-pill gap-1.5 text-xs lowercase text-zinc-400"
              >
                <TechIcon name={tool.label} />
                {tool.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="fade-in-up delay-4 text-center text-[11px] text-zinc-100" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://azron.net"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors underline underline-offset-4"
          >
            azron.net
          </a>
        </footer>
      </div>
    </main>
  );
}
