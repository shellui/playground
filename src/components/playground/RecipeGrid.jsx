import { useTranslation } from 'react-i18next';

/**
 * "Start from a recipe": each tile fills the options, it does not run anything.
 *
 * @param {{ recipes: { id: string; name: string; sub: string; thumb: import('react').ReactNode }[];
 *   active: string | null; onPick: (id: string) => void }} props
 */
export default function RecipeGrid({ recipes, active, onPick }) {
  const { t } = useTranslation();
  return (
    <section
      aria-labelledby="pg-recipes"
      className="mb-[18px]"
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2
          id="pg-recipes"
          className="font-heading text-[15px] font-semibold"
        >
          {t('pg.recipes')}
        </h2>
        <p className="text-right text-[13px] text-muted-foreground">{t('pg.recipesHint')}</p>
      </div>
      <div
        className="pg-recipes"
        data-count={recipes.length}
      >
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            aria-pressed={active === recipe.id}
            onClick={() => onPick(recipe.id)}
            className="flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-border bg-card text-left text-foreground transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-primary"
          >
            <div
              className="pg-dots relative flex h-[78px] items-center justify-center overflow-hidden border-b border-border"
              aria-hidden
            >
              {recipe.thumb}
            </div>
            <div className="px-2.5 pt-2 pb-2.5 text-[13px] leading-snug font-medium">
              {recipe.name}
              <small className="mt-0.5 block truncate font-mono text-[11.5px] font-normal text-muted-foreground">
                {recipe.sub}
              </small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
