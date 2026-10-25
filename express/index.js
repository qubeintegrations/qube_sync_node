"use strict";

// qubesync/express: QuBe Sync's integration kit for Express 4 and 5. Three routers, since they
// mount in different places:
//
//   app.use(webhooks());       // before app.use(express.json()): no sign-in, no CSRF
//   app.use(express.json());
//   app.use(requireSignIn);    // your sign-in, and your CSRF protection
//   app.use(connect());        // POST /quickbooks/connect
//   app.use(questions());      // POST /qube/questions/:operation/:record_id, GET .../search
//
// Each is optional: mount the ones your app uses. The routes are relative to where they're
// mounted (app.use("/app", connect()) serves POST /app/quickbooks/connect). What they do is
// qubesync/kit's, read from the settings your app's quickbooks-desktop/config sets with
// configure(...); each factory also takes that file's export (or more settings) as its argument.

const kit = require("../kit");
const { Settings, configure } = require("../kit/settings");

const ROUTER_OPTIONS = {
  webhooks: ["limit"],
  connect: [],
  questions: ["limit"],
};

// The biggest webhook body taken: a pull_changes page with its records can be well over
// Express's own 100 kb default, and a body refused with a 413 is retried until it fails.
const DEFAULT_WEBHOOK_LIMIT = "5mb";

function loadExpress() {
  try {
    return require("express");
  } catch (err) {
    if (err && err.code === "MODULE_NOT_FOUND" && /['"]express['"]/.test(err.message)) {
      throw new Error("qubesync/express needs Express (4 or 5): npm install express");
    }
    throw err;
  }
}

// The router's own options, with any settings among them passed to configure first.
function routerOptions(name, opts) {
  if (opts === undefined || opts === null || opts instanceof Settings) return {};
  if (typeof opts !== "object") throw new TypeError(`QuBe Sync: ${name}(options) takes an object`);
  const own = {};
  const rest = {};
  for (const key of Object.keys(opts)) {
    if (ROUTER_OPTIONS[name].includes(key)) own[key] = opts[key];
    else rest[key] = opts[key];
  }
  if (Object.keys(rest).length > 0) configure(rest);
  return own;
}

// Express 4 doesn't catch a rejected promise: every handler passes its error on.
function handler(fn) {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };
}

/**
 * POST /webhooks/qube/:operation/:record_id: verifies the delivery over its raw body, answers
 * 404 for a slug none of your operations has, enqueues it and answers 200 (401 for a signature
 * that doesn't hold, with only its reason logged). Mount it before express.json(), which would
 * read the body first and leave nothing to verify. options.limit: the biggest body taken
 * (default "5mb").
 */
function webhooks(options) {
  const express = loadExpress();
  const { limit = DEFAULT_WEBHOOK_LIMIT } = routerOptions("webhooks", options);
  const router = express.Router();

  router.post(
    "/webhooks/qube/:operation/:record_id",
    // Nothing may have read the body before this route: the signature is over its bytes.
    (req, res, next) => {
      if (req.body !== undefined) {
        return next(
          new Error(
            "QuBe Sync: the webhook's body was already parsed (express.json() or another body parser runs before webhooks()), so there's nothing left to verify. Mount webhooks() before them."
          )
        );
      }
      next();
    },
    // express.raw keeps the body's bytes, on this route only, whatever its content type.
    express.raw({ type: () => true, limit }),
    handler(async (req, res) => {
      // No body at all is left unset (Express 5) or {} (Express 4): verify an empty one.
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
      const { status } = await kit.receiveWebhook({
        operation: req.params.operation,
        recordId: req.params.record_id,
        body,
        signature: req.get("X-Qube-Signature"),
      });
      res.sendStatus(status);
    })
  );
  return router;
}

/**
 * POST /quickbooks/connect, from a "Connect QuickBooks Desktop" button: onboarding for the
 * account the currentAccount setting finds, then a redirect to QuBe Sync's setup. Mount it behind
 * your sign-in. QuBe Sync's setup doesn't come back to your app: it tells your connection class
 * by webhook.
 */
function connect(options) {
  const express = loadExpress();
  routerOptions("connect", options);
  const router = express.Router();
  router.post(
    "/quickbooks/connect",
    handler(async (req, res) => {
      const { status, location } = await kit.startOnboarding(req);
      if (location) return res.redirect(status, location);
      res.sendStatus(status);
    })
  );
  return router;
}

/**
 * Your user's answers to a run's questions, from renderQuestion's forms, and a record field's
 * search:
 *   POST /qube/questions/:operation/:record_id         a choice, with its fields
 *   GET  /qube/questions/:operation/:record_id/search  a record field's matches, as JSON
 * Mount it behind your sign-in and your CSRF protection. Each asks the authorizeQuestion setting
 * before anything else, and refuses every answer and search until it's set. options.limit: the
 * biggest form taken (default Express's 100 kb).
 */
function questions(options) {
  const express = loadExpress();
  const { limit } = routerOptions("questions", options);
  const router = express.Router();

  router.post(
    "/qube/questions/:operation/:record_id",
    express.urlencoded(limit === undefined ? { extended: false } : { extended: false, limit }),
    handler(async (req, res) => {
      const result = await kit.answerQuestion({
        operation: req.params.operation,
        recordId: req.params.record_id,
        form: req.body || {},
        request: req,
      });
      if (result.status === 303) return res.redirect(303, back(req));
      res.status(result.status).type("text/plain").send(result.message);
    })
  );

  router.get(
    "/qube/questions/:operation/:record_id/search",
    handler(async (req, res) => {
      const { status, json } = await kit.searchQuestion({
        operation: req.params.operation,
        recordId: req.params.record_id,
        field: req.query.field,
        q: req.query.q,
        request: req,
      });
      res.status(status).json(json);
    })
  );
  return router;
}

// The page the answer came from, when it's this app's; else /.
function back(req) {
  const referer = req.get("Referer");
  try {
    if (referer && new URL(referer).host === req.get("Host")) return referer;
  } catch (_ignored) {
    // not a URL
  }
  return "/";
}

module.exports = { webhooks, connect, questions, DEFAULT_WEBHOOK_LIMIT };
