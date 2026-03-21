import { buildHeatmapSegments } from "@/lib/buildHeatmapSegments";

const segmentClassByStrength = {
  plain: "",
  strong: "rounded bg-green-200 px-0.5 text-green-900",
  weak: "rounded bg-red-200 px-0.5 text-red-900",
};

export default function HeatmapViewer({ text, strongPhrases, weakPhrases }) {
  const segments = buildHeatmapSegments(text, strongPhrases, weakPhrases);

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <h3 className="text-sm font-medium text-zinc-800">Heatmap Viewer</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {segments.map((segment, index) => (
          <span
            key={`${segment.strength}-${index}-${segment.content.slice(0, 12)}`}
            className={segmentClassByStrength[segment.strength]}
          >
            {segment.content}
          </span>
        ))}
      </p>
    </div>
  );
}
