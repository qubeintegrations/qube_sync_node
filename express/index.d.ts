// Type definitions for qubesync/express: QuBe Sync's integration kit for Express 4 and 5.

import type { Request, Response, Router } from "express";
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
 * POST /quickbooks/connections (name, new=1, simulated=1 outside production) and POST /quickbooks/connections/:id/onboarding: 303
 * to the setup, 401 with no signed-in account, 404 for another account's connection. Mount it
 * behind your sign-in.
 */
export declare function connect(options?: SettingsOptions | Settings): Router;

/**
 * POST /qube/questions/runs/:id, GET .../search, POST /qube/runs/:id/retry_start and POST /qube/runs/:id/redeliver: 404
 * when authorizeQuestion refuses; what can't go through redirects back with a message for takeError. Mount it behind
 * your sign-in and CSRF protection.
 */
export declare function questions(options?: RouterOptions<QuestionsOptions> | Settings): Router;

/**
 * The message a route sent the user back with (kept in req.flash, the session, or a cookie), or null. Taken once: pass
 * it to renderRunStatus or renderQuestion as error.
 */
export declare function takeError(req: Request, res: Response): string | null;

/** Back to the page the request came from (303), with error, if any, kept for takeError: for your own routes, such as a start button's. */
export declare function redirectBack(req: Request, res: Response, error?: string | null): void;
