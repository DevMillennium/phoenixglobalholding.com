export const DIVISION_SLUGS = [
  "import-export",
  "developer",
  "enterprise-solution",
] as const;

export type DivisionSlug = (typeof DIVISION_SLUGS)[number];

export function isDivisionSlug(s: string): s is DivisionSlug {
  return (DIVISION_SLUGS as readonly string[]).includes(s);
}

/** Namespace next-intl por slug */
export const divisionNamespace: Record<
  DivisionSlug,
  | "DivisionImportExport"
  | "DivisionDeveloper"
  | "DivisionEnterprise"
> = {
  "import-export": "DivisionImportExport",
  developer: "DivisionDeveloper",
  "enterprise-solution": "DivisionEnterprise",
};
