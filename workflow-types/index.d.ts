// Type definitions for qubesync/workflow-types: typed workflow starts, rendered from an app's
// workflow input types (`npx qubesync workflows`).

import type { WorkflowTypesDocument, WorkflowTypesOptions, NOT_MODIFIED } from "../index";

/** The command a generated file's header says to run again. */
export declare const COMMAND: "npx qubesync workflows";
/** The specifier a generated .js's JSDoc imports its .d.ts by, by default. */
export declare const TYPES: "./qube-workflows";

/** A document this version can't render: not a workflow types document, or a name QuBe Sync doesn't allow. */
export declare class WorkflowTypesError extends Error {
  readonly name: "WorkflowTypesError";
}

export interface RenderOptions {
  /** The URL the header names (`https://qubesync.com/api/v2/workflows/types`). One line. */
  source: string;
  /** Type each workflow's draft where it has one. Default false. */
  drafts?: boolean;
  /** The command the header says to run again. Default COMMAND. */
  command?: string;
  /** The specifier the .js's JSDoc imports the .d.ts by: "./qube-workflows", or "./name.cjs" beside a name.d.cts. */
  types?: string;
}

/** A render: the module, its declarations, and what their header records. */
export interface RenderedFiles {
  js: string;
  dts: string;
  digest: string;
  drafts: boolean;
  /** A served operations_digest other than this version's. */
  warnings: string[];
}

/** Renders a document (what `client.workflowTypes()` resolves to). The same document gives byte-identical files. */
export declare function render(document: WorkflowTypesDocument, options: RenderOptions): RenderedFiles;

/** The workflows a render types, as [key, entry], sorted by key. */
export declare function select(document: WorkflowTypesDocument, drafts: boolean): Array<[string, WorkflowTypesDocument["workflows"][string]]>;

/** The digest and drafts a generated file's header records, or null when it has none. */
export declare function header(text: string): { digest: string; drafts: boolean } | null;

/** The workflows whose generated object differs between two renders' .js: "upsert (changed)", "resolve (new)", "ensure (removed)". */
export declare function changes(before: string, after: string): string[];

/** A served operations_digest other than this version's, as a warning. */
export declare function warnings(document: WorkflowTypesDocument): string[];

export type CheckStatus = "current" | "stale" | "unreachable" | "error";

export interface CheckResult {
  /** unreachable: QuBe Sync didn't answer, or answered 5xx (nothing was checked); error: a 401, another 4xx, a file without a header. */
  status: CheckStatus;
  /** One line. */
  message: string;
  /** The workflows that changed, when stale. */
  changes: string[];
  warnings: string[];
  /** 0 when current or unreachable; 1 otherwise. */
  exitStatus: 0 | 1;
}

export interface CheckOptions {
  /** A qubesync Client, or anything answering workflowTypes as it does. */
  client: { workflowTypes(options?: WorkflowTypesOptions): Promise<WorkflowTypesDocument | typeof NOT_MODIFIED> };
  source: string;
  /** The file's name in messages. */
  path: string;
  command?: string;
  types?: string;
}

/** Compares a generated .js (its text) with what QuBe Sync serves now, fetched with the drafts flag the file records. */
export declare function check(existing: string, options: CheckOptions): Promise<CheckResult>;

export interface CliOptions {
  env?: { [name: string]: string | undefined };
  out?: { write(text: string): unknown };
  err?: { write(text: string): unknown };
  cwd?: string;
  clientFactory?: (settings: { apiKey: string; baseUrl: string }) => CheckOptions["client"];
}

/** `npx qubesync workflows [--drafts] [--check] [--output PATH]`; resolves to the exit status. */
export declare function cli(argv: readonly string[], options?: CliOptions): Promise<number>;
