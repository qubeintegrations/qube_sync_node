// Type definitions for qubesync/express: QuBe Sync's integration kit for Express 4 and 5.

import type { Router } from "express";
import type { Settings, SettingsOptions } from "../kit/index";

/** The router's own options; any other key is a setting, passed to configure first. */
export type RouterOptions<Own> = Own & SettingsOptions;

export interface WebhooksOptions {
  /** The biggest webhook body taken, as express.raw takes it. Default "5mb". */
  limit?: string | number;
}

export interface QuestionsOptions {
  /** The biggest answer form taken, as express.urlencoded takes it. Default Express's 100 kb. */
  limit?: string | number;
}

export declare const DEFAULT_WEBHOOK_LIMIT: string;

/**
 * POST /webhooks/qube/:operation/:record_id: verify, 404 for an unknown slug, enqueue, 200 (401
 * for a bad signature). Mount it before express.json().
 */
export declare function webhooks(options?: RouterOptions<WebhooksOptions> | Settings): Router;

/** POST /quickbooks/connect: onboarding for the signed-in account. Mount it behind your sign-in. */
export declare function connect(options?: SettingsOptions | Settings): Router;

/**
 * POST /qube/questions/:operation/:record_id and GET .../search: answers and a record field's
 * search. Mount it behind your sign-in and CSRF protection.
 */
export declare function questions(options?: RouterOptions<QuestionsOptions> | Settings): Router;
