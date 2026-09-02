/**
 * Minimal ambient types for `npm-packlist`, which ships untyped.
 * Only the surface `validate-dist.ts` uses is declared.
 */
declare module 'npm-packlist' {
  /** The arborist-style tree npm-packlist reads the `files` allowlist from. */
  export interface PacklistTree {
    /** Parsed `package.json` of the package being packed. */
    package: object;
    /** Absolute path to the package root. */
    path: string;
    isProjectRoot?: boolean;
    /** Dependency edges; empty for packages without bundled deps. */
    edgesOut?: Map<string, unknown>;
  }

  /** Resolves the paths, relative to the package root, that `npm pack` would include. */
  export default function packlist(tree: PacklistTree): Promise<string[]>;
}
