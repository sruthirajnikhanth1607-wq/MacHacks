import Image from "next/image";

type RecruiterLogoProps = {
  /** Pixel size (width & height). Default 40. */
  size?: number;
  className?: string;
  priority?: boolean;
};

/** Navy chip behind the mark — matches the dark UI (not pure black). */
const LOGO_SURFACE = "#0f172a";

/**
 * Brand mark — `/public/recruiterai-logo.png`
 * Navy surface + oversized crop; `mix-blend-lighten` lets flat black in the
 * asset pick up the navy so it doesn’t read as a separate black disc.
 */
export function RecruiterLogo({
  size = 40,
  className = "",
  priority = false,
}: RecruiterLogoProps) {
  return (
    <span
      className={`relative isolate inline-flex shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-[#0f172a]/90 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: LOGO_SURFACE,
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "152%",
          height: "152%",
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src="/recruiterai-logo.png"
            alt="RecruiterAI"
            fill
            priority={priority}
            sizes={`${size}px`}
            className="object-cover object-center mix-blend-lighten [transform:translateZ(0)]"
          />
        </div>
      </div>
    </span>
  );
}
