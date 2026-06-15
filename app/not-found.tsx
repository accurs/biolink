import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-12">
      <div className="scanline" />

      <div className="relative z-10 flex w-full max-w-xl flex-col gap-5 fade-in-up">
        <div className="glass-card p-5">
          <p className="heading-font text-5xl font-semibold tracking-tight text-zinc-100">404</p>
          <p className="mt-2 text-sm lowercase text-zinc-400">
            this page doesn&apos;t exist or was moved.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="glass-pill gap-1.5 text-xs lowercase text-zinc-300"
            >
              <FiArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
