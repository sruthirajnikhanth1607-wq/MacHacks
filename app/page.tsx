import Link from "next/link";

export default function SplashPage() {
  return (
    <div className="splash-root relative min-h-screen overflow-hidden bg-[#050508] text-zinc-100">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-violet-600/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[90px]"
      />

      {/* Grid */}
      <div
        aria-hidden
        className="splash-grid pointer-events-none absolute inset-0 opacity-[0.35]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-violet-500/25">
              R
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">
                RecruiterAI
              </p>
              <p className="text-xs text-zinc-500">Resume ↔ job intelligence</p>
            </div>
          </div>
          <Link
            href="/analyze"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
          >
            Open app →
          </Link>
        </header>

        <main className="mt-16 flex flex-1 flex-col items-center text-center md:mt-20">
          <p className="splash-badge inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            AI-powered matching
          </p>

          <h1 className="mt-8 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.08]">
            Turn any resume into a{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              role-matched pitch
            </span>{" "}
            in seconds.
          </h1>

          <p className="splash-subtitle mt-6 max-w-2xl text-pretty text-base leading-relaxed text-zinc-400 md:text-lg">
            Add a job description, upload your resume, and get a clear match
            score, gap analysis, and stronger bullet points you can use right
            away.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/analyze"
              className="splash-cta group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.7)] transition hover:shadow-[0_0_55px_-8px_rgba(34,211,238,0.55)]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 transition group-hover:brightness-110" />
              <span className="relative flex items-center gap-2">
                Get started
                <svg
                  className="h-5 w-5 transition group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Link>
            <a
              href="https://github.com/sruthirajnikhanth1607-wq/MacHacks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-zinc-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>

          <section
            className="mt-20 w-full max-w-4xl text-left"
            aria-labelledby="splash-features-heading"
          >
            <div className="border-t border-white/10 pt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Features
              </p>
              <h2
                id="splash-features-heading"
                className="mt-2 text-lg font-semibold text-white md:text-xl"
              >
                What RecruiterAI includes
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Each run-through highlights how your experience lines up with the
                role — not just a single number.
              </p>
            </div>

            <ul className="mt-10 space-y-8 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-10">
              <li className="flex gap-4 sm:flex-col sm:gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-violet-300"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v4.125c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 17.25v-4.125zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.625c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v13.125c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Match score
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    See how closely your resume aligns with the job description.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 sm:flex-col sm:gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-300"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 6.75H15a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0115 21.75H9a2.25 2.25 0 01-2.25-2.25V9A2.25 2.25 0 019 6.75zM9 6.75V4.875A2.625 2.625 0 0111.625 2.25h.75a2.625 2.625 0 012.625 2.625V6.75M9 6.75h6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6M9 15.75h4.5"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Gap map</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    Spot missing skills and priorities so you know what to fix
                    first.
                  </p>
                </div>
              </li>

              <li className="flex gap-4 sm:flex-col sm:gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-fuchsia-300"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Rewrite</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                    Get stronger, role-specific bullet lines you can paste into
                    your resume.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs text-zinc-600">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Next.js · React
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Gemini-powered analysis
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
              PDF &amp; DOCX upload
            </span>
          </div>
        </main>

        <footer className="mt-auto border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} RecruiterAI ·{" "}
          <Link
            href="/analyze"
            className="text-zinc-400 underline-offset-4 hover:underline"
          >
            Analyze a resume
          </Link>
        </footer>
      </div>
    </div>
  );
}
