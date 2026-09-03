export default function Card({
  title,
  accent = "#C9A227",
  children,
  id,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="rounded-lg border border-[#E4E1D8] bg-white p-6"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <h2 className="text-lg font-semibold text-[#1B2A4A] [font-family:var(--font-serif)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}