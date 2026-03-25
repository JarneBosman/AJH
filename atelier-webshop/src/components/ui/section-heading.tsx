interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  eyebrowEditableId?: string;
  titleEditableId?: string;
  descriptionEditableId?: string;
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
  eyebrowEditableId,
  titleEditableId,
  descriptionEditableId,
}: SectionHeadingProps) => {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? (
        <p
          {...(eyebrowEditableId
            ? {
                "data-cms-editable": eyebrowEditableId,
                "data-cms-edit-types": "text,color,location",
              }
            : {})}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-wood)]"
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        {...(titleEditableId
          ? {
              "data-cms-editable": titleEditableId,
              "data-cms-edit-types": "text,color,location",
            }
          : {})}
        className="text-balance text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p
          {...(descriptionEditableId
            ? {
                "data-cms-editable": descriptionEditableId,
                "data-cms-edit-types": "text,color,location",
              }
            : {})}
          className="mt-4 text-pretty text-base leading-7 text-[var(--color-muted)]"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};
