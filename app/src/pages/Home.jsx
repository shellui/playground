import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const FEATURES = [
  { path: "/dialog", key: "pageDialogTitle" },
  { path: "/toaster", key: "pageToasterTitle" },
  { path: "/modal", key: "pageModalDrawerTitle" },
  { path: "/layout", key: "pageLayoutTitle" },
  { path: "/themes", key: "pageThemesTitle" },
  { path: "/languages", key: "pageLanguagesTitle" },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="font-body text-foreground max-w-3xl">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          {t("playgroundTitle")}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t("playgroundTagline")}
        </p>
        <p className="mt-4 text-foreground">{t("playgroundIntro")}</p>
      </header>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
          {t("playgroundWhatIs")}
        </h2>
        <p className="text-foreground text-muted-foreground">
          {t("playgroundWhatIsBody")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
          {t("playgroundTrySections")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {t("playgroundTrySectionsBody")}
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 m-0">
          {FEATURES.map(({ path, key }) => (
            <li key={path}>
              <Link to={path} className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                >
                  {t(key)}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-muted-foreground text-sm flex items-center gap-2 flex-wrap">
        {t("playgroundCodeOnGitHub")}
        <a
          href="https://github.com/shellui/playground"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label="GitHub: shellui/playground"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          shellui/playground
        </a>
        {t("playgroundHostedOnGitHubPages")}
      </p>
    </div>
  );
}
