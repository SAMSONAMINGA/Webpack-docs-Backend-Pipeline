/**
 * Intermediate JSON Schema (IJS)
 * ------------------------------
 * This is the single source of truth that flows between every stage of the
 * pipeline: extraction -> normalization -> markdown generation -> site build.
 *
 * It is intentionally version-agnostic: Webpack v5, v6, and future majors
 * are all normalized into this shape by a Version Adapter before anything
 * downstream ever sees them. Nothing past `normalize.ts` should know which
 * Webpack version produced the data.
 *
 * SCHEMA VERSIONING: bump `IJS_SCHEMA_VERSION` whenever a breaking shape
 * change is made. Downstream consumers (typedoc-theme, site) should check
 * this value and fail loudly rather than silently mis-render older/newer
 * shapes.
 */
import { z } from "zod";

export const IJS_SCHEMA_VERSION = "1.0.0" as const;

export const SymbolKindSchema = z.enum([
  "interface",
  "type",
  "class",
  "function",
  "enum",
  "variable",
  "namespace",
  "unknown",
]);
export type SymbolKind = z.infer<typeof SymbolKindSchema>;

export const CategorySchema = z.enum([
  "Configuration",
  "Plugins",
  "Loaders",
  "API",
  "Uncategorized",
]);
export type Category = z.infer<typeof CategorySchema>;

export const ParameterSchema = z.object({
  name: z.string(),
  type: z.string(),
  optional: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
});
export type Parameter = z.infer<typeof ParameterSchema>;

export const PropertySchema = z.object({
  name: z.string(),
  type: z.string(),
  optional: z.boolean().default(false),
  readonly: z.boolean().default(false),
  description: z.string().optional(),
});
export type Property = z.infer<typeof PropertySchema>;

export const SignatureSchema = z.object({
  parameters: z.array(ParameterSchema).default([]),
  returnType: z.string().default("void"),
  description: z.string().optional(),
});
export type Signature = z.infer<typeof SignatureSchema>;

/**
 * A single documented symbol (interface, type alias, class, function, enum...).
 * `sourceRef` and `reasonExcludedIfAny` exist specifically so a human can
 * always ask "why was X included/excluded?" and get a real answer.
 */
export const DocSymbolSchema = z.object({
  id: z.string(), // stable id, e.g. "Configuration" or "RuleSetRule.test"
  name: z.string(),
  kind: SymbolKindSchema,
  category: CategorySchema,
  description: z.string().default(""),
  properties: z.array(PropertySchema).default([]),
  signatures: z.array(SignatureSchema).default([]),
  enumMembers: z.array(z.object({ name: z.string(), value: z.string().optional() })).default([]),
  extends: z.array(z.string()).default([]),
  sourceFile: z.string(),
  sourceLine: z.number().optional(),
  visibility: z.enum(["public", "private", "protected", "internal"]).default("public"),
  deprecated: z.boolean().default(false),
  included: z.boolean().default(true),
  exclusionReason: z.string().optional(),
});
export type DocSymbol = z.infer<typeof DocSymbolSchema>;

export const ExtractionWarningSchema = z.object({
  message: z.string(),
  sourceFile: z.string().optional(),
  sourceLine: z.number().optional(),
  symbolName: z.string().optional(),
  severity: z.enum(["info", "warning", "unknown-construct"]).default("warning"),
});
export type ExtractionWarning = z.infer<typeof ExtractionWarningSchema>;

export const IntermediateDocSchema = z.object({
  schemaVersion: z.literal(IJS_SCHEMA_VERSION),
  webpackVersion: z.string(), // resolved semver of the package that was scanned
  adapter: z.string(), // which Version Adapter produced this document
  generatedAt: z.string(), // ISO timestamp
  symbols: z.array(DocSymbolSchema),
  warnings: z.array(ExtractionWarningSchema).default([]),
  stats: z.object({
    totalFound: z.number(),
    totalIncluded: z.number(),
    totalExcluded: z.number(),
    byCategory: z.record(CategorySchema, z.number()).default({} as Record<Category, number>),
    byKind: z.record(SymbolKindSchema, z.number()).default({} as Record<SymbolKind, number>),
  }),
});
export type IntermediateDoc = z.infer<typeof IntermediateDocSchema>;

export function validateIntermediateDoc(data: unknown): IntermediateDoc {
  return IntermediateDocSchema.parse(data);
}
