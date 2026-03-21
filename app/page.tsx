import Link from "next/link";

export default function SplashPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(59,130,246,0.22),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(139,92,246,0.12),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 md:px-8 md:py-14">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold tracking-tight text-transparent md:text-2xl">
            RecruiterAI
          </span>
          <Link
            href="/analyze"
            className="rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-200 transition-all duration-200 hover:border-gray-500 hover:bg-gray-800/80"
          >
            Open analyzer
          </Link>
        </header>

        <main className="mt-16 flex flex-1 flex-col items-center text-center md:mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400/95">
            AI-powered resume feedback
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl md:leading-[1.05]">
            <span className="bg-gradient-to-r from-sky-200 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Optimize your resume
            </span>
            <br />
            <span className="text-gray-100">for the role you want</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-400 md:text-lg">
            Drop in your resume and a job description. Get a match score,
            strengths and gaps, improved bullets, scan tips, and optional GitHub
            ideas — fast, clear, and demo-ready.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl active:scale-[0.98]"
            >
              Get started
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center rounded-xl border border-gray-600 bg-gray-800/40 px-8 py-4 text-base font-medium text-gray-200 backdrop-blur-sm transition-all duration-200 hover:bg-gray-800/90"
            >
              Analyze resume
            </Link>
          </div>

          <ul className="mt-20 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
            {[
              {
                title: "Match & gaps",
                body: "See fit score and what’s missing for this posting.",
              },
              {
                title: "Recruiter scan tips",
                body: "Plain-language layout tips based on how people skim resumes.",
              },
              {
                title: "GitHub optional",
                body: "Tie public repos to your story when you add a username.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-gray-700/90 bg-gray-800/60 p-5 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-gray-600"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </main>

        <footer className="mt-16 border-t border-gray-800/80 pt-8 text-center text-xs text-gray-600">
          No sign-up · Runs in your browser · Add{" "}
          <code className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">
            GEMINI_API_KEY
          </code>{" "}
          locally
        </footer>
      </div>
    </div>
  );
}
