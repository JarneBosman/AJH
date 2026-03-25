"use client";

import { CustomizationOption } from "@/types/shop";
import { cn } from "@/lib/cn";
import { useI18n } from "@/context/i18n-context";

interface OptionSelectorProps {
  option: CustomizationOption;
  selectedChoiceId: string;
  onChange: (choiceId: string) => void;
}

export const OptionSelector = ({
  option,
  selectedChoiceId,
  onChange,
}: OptionSelectorProps) => {
  const { language } = useI18n();
  const optionLabel = language === "nl" && option.labelNl ? option.labelNl : option.label;
  const optionHelperText =
    language === "nl" && option.helperTextNl ? option.helperTextNl : option.helperText;

  const getChoiceLabel = (choice: CustomizationOption["choices"][number]) =>
    language === "nl" && choice.labelNl ? choice.labelNl : choice.label;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[var(--color-ink)]">
        {optionLabel}
      </legend>

      {optionHelperText ? (
        <p className="text-xs text-[var(--color-muted)]">{optionHelperText}</p>
      ) : null}

      {option.type === "dropdown" ? (
        <label className="sr-only" htmlFor={option.id}>
          {optionLabel}
        </label>
      ) : null}

      {option.type === "dropdown" ? (
        <select
          id={option.id}
          value={selectedChoiceId}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-wood)]"
        >
          {option.choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {getChoiceLabel(choice)}
              {choice.priceModifier !== 0
                ? ` (${choice.priceModifier > 0 ? "+" : ""}${choice.priceModifier})`
                : ""}
            </option>
          ))}
        </select>
      ) : null}

      {option.type === "toggle" ? (
        <div className="flex flex-wrap gap-2">
          {option.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange(choice.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
                selectedChoiceId === choice.id
                  ? "border-[var(--color-wood-dark)] bg-[var(--color-wood-dark)] text-white"
                  : "border-black/10 bg-white text-[var(--color-ink)] hover:border-[var(--color-wood)]",
              )}
            >
              {getChoiceLabel(choice)}
            </button>
          ))}
        </div>
      ) : null}

      {option.type === "swatch" ? (
        <div className="flex flex-wrap gap-3">
          {option.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onChange(choice.id)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
                selectedChoiceId === choice.id
                  ? "border-[var(--color-wood-dark)] bg-[var(--color-neutral-100)]"
                  : "border-black/10 bg-white hover:border-[var(--color-wood)]",
              )}
              aria-label={`${optionLabel}: ${getChoiceLabel(choice)}`}
            >
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: choice.swatchHex || "#d8d8d8" }}
              />
              {getChoiceLabel(choice)}
            </button>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
};
