// Type definitions for qubesync/express: QuBe Sync's integration kit for Express 4 and 5.

import type { Router } from "express";
import type { Settings, SettingsOptions } from "../kit/index";

/** The router's own options; any other key is a setting, passed to configure first. */
export type RouterOptions<Own> = Own & SettingsOptions;

export interface QuestionsOptions {
  /** The biggest answer form taken, as express.urlencoded takes it. Default Express's 100 kb. */
  limit?: string | number;
}

/**
 * POST /webhooks/qube/runs/:id and POST /webhooks/qube/connections/:id: verify (401), find the row
 * (404), enqueue (200, or 503 when the enqueue didn't take it); up to 5 MB (413). Mount it before
 * express.json().
 */
export declare function webhooks(options?: SettingsOptions | Settings): Router;

/**
 * POST /quickbooks/connections (name, new=1) and POST /quickbooks/connections/:id/onboarding: 303
 * to the setup, 401 with no signed-in account, 404 for another account's connection. Mount it
 * behind your sign-in.
 */
export declare function connect(options?: SettingsOptions | Settings): Router;

/**
 * POST /qube/questions/runs/:id, GET .../search and POST /qube/runs/:id/retry_start: 403 with no
 * policy to ask, 404 when authorizeQuestion refuses, 409 when the question (or the start) has
 * changed. Mount it behind your sign-in and CSRF protection.
 */
export declare function questions(options?: RouterOptions<QuestionsOptions> | Settings): Router;
