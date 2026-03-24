interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) => {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-7 text-[var(--color-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
};
