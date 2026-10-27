"use strict";

// qubesync/express: QuBe Sync's integration kit for Express 4 and 5. Three routers, since they
// mount in different places:
//
//   app.use(webhooks());       // before app.use(express.json()): no sign-in, no CSRF
//   app.use(express.json());
//   app.use(requireSignIn);    // your sign-in, and your CSRF protection
//   app.use(connect());        // POST /quickbooks/connections, .../:id/onboarding, DELETE .../:id
//   app.use(questions());      // POST /qube/questions/runs/:id, GET .../search, POST /qube/runs/:id/retry_start and /redeliver
//
// Each is optional: mount the ones your app uses. The routes are relative to where they're
// mounted (app.use("/app", connect()) serves POST /app/quickbooks/connections). What they do is
// qubesync/kit's, read from the settings your app's quickbooks-desktop/config sets with
// configure(...); each factory also takes that file's export (or more settings) as its argument.

const kit = require("../kit");
const { Settings, configure } = require("../kit/settings");

const ROUTER_OPTIONS = {
  webhooks: [],
  connect: [],
  questions: ["limit"],
};

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

// A form's field, from the body your app's parser or this router's read, else the query string.
function param(req, name) {
  const body = req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body) ? req.body : {};
  const value = body[name] !== undefined ? body[name] : req.query ? req.query[name] : undefined;
  return typeof value === "string" ? value : undefined;
}

/**
 * POST /webhooks/qube/runs/:id, /webhooks/qube/connections/:id and /webhooks/qube/requests/:id: verify the delivery over
 * its raw body (401 for a signature that doesn't hold, with only its reason logged), answer 404
 * when the row isn't there, enqueue it and answer 200, or 503 when the enqueue didn't take it.
 * Any content type, up to 5 MB (413 beyond). Mount it before express.json(), which would read the
 * body first and leave nothing to verify.
 */
function webhooks(options) {
  const express = loadExpress();
  routerOptions("webhooks", options);
  const router = express.Router();

  for (const kind of ["run", "connection", "request"]) {
    router.post(
      `/webhooks/qube/${kind}s/:id`,
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
      // express.raw keeps the body's bytes, on this route only, whatever its content type, and
      // answers 413 for one over the limit.
      express.raw({ type: () => true, limit: kit.MAX_BODY_BYTES }),
      handler(async (req, res) => {
        // No body at all is left unset (Express 5) or {} (Express 4): verify an empty one.
        const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        const path = String(req.originalUrl || req.url).split("?")[0];
        const { status } = await kit.receiveWebhook({ kind, id: req.params.id, body, signature: req.get("X-Qube-Signature"), path });
        res.sendStatus(status);
      }),
      // A body over the limit, refused unread.
      (err, req, res, next) => {
        if (!err || err.type !== "entity.too.large") return next(err);
        console.warn(`QuBe Sync: refused a webhook: its body is over ${kit.MAX_BODY_BYTES} bytes`);
        res.sendStatus(413);
      }
    );
  }
  return router;
}

/**
 * POST /quickbooks/connections, from a "Connect QuickBooks Desktop" button (optional name, new=1
 * for another company file, simulated=1 outside production for a simulated one), and POST /quickbooks/connections/:id/onboarding, one of the
 * signed-in account's connections back through setup (404 for another account's): each redirects
 * (303) to QuBe Sync's setup, or answers 401 when currentAccount finds no account. Mount it behind
 * your sign-in and CSRF protection. QuBe Sync's setup doesn't come back to your app: it tells the
 * connection by webhook.
 *
 * DELETE /quickbooks/connections/:id disconnects one of the signed-in account's connections
 * (disconnectQuickbooks), and redirects back (303), with RUNS_GOING while a run or request hasn't
 * ended. POST /quickbooks/connections/:id/disconnect does the same, for an HTML form, which can't
 * send DELETE.
 */
function connect(options) {
  const express = loadExpress();
  routerOptions("connect", options);
  const router = express.Router();
  const form = express.urlencoded({ extended: false });

  router.post(
    "/quickbooks/connections",
    form,
    handler(async (req, res) => {
      const result = await kit.connectQuickbooks({
        request: req,
        name: param(req, "name"),
        another: param(req, "new") === "1",
        simulated: param(req, "simulated") === "1",
      });
      send(req, res, result);
    })
  );
  router.post(
    "/quickbooks/connections/:id/onboarding",
    handler(async (req, res) => {
      send(req, res, await kit.resendOnboarding({ request: req, id: req.params.id }));
    })
  );
  const disconnect = handler(async (req, res) => {
    send(req, res, await kit.disconnectQuickbooks({ request: req, id: req.params.id }));
  });
  router.delete("/quickbooks/connections/:id", disconnect);
  router.post("/quickbooks/connections/:id/disconnect", disconnect);
  return router;
}

// A kit result: a redirect (303 with no location: back to the page, with its error kept for the
// page to show once), or a status with its plain-text message.
function send(req, res, { status, location, error, message }) {
  if (location) return res.redirect(status, location);
  if (status === 303) {
    if (error) keepError(req, res, error);
    return res.redirect(303, back(req));
  }
  if (message) return res.status(status).type("text/plain").send(message);
  res.sendStatus(status);
}

const ERROR_COOKIE = "qube_error";
const ERROR_KEY = "qubeError";
const MAX_ERROR_LENGTH = 500;

// connect-flash's req.flash when there is one, else the session, else a short-lived cookie.
function keepError(req, res, error) {
  const text = String(error).slice(0, MAX_ERROR_LENGTH);
  if (typeof req.flash === "function") return req.flash(ERROR_KEY, text);
  if (hasSession(req)) {
    req.session[ERROR_KEY] = text;
    return undefined;
  }
  res.cookie(ERROR_COOKIE, text, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 1000, secure: req.secure });
  return undefined;
}

/**
 * The message a question, retry or redelivery route sent the user back with, or null; taken once,
 * so pass it to one of renderRunStatus or renderQuestion (their error option).
 */
function takeError(req, res) {
  if (typeof req.flash === "function") {
    const [first] = req.flash(ERROR_KEY) || [];
    if (first) return first;
  }
  if (hasSession(req) && req.session[ERROR_KEY]) {
    const text = req.session[ERROR_KEY];
    delete req.session[ERROR_KEY];
    return text;
  }
  const text = cookieValue(req, ERROR_COOKIE);
  if (text === null) return null;
  res.clearCookie(ERROR_COOKIE, { path: "/" });
  return text === "" ? null : text;
}

// express-session's, or any session middleware's object.
function hasSession(req) {
  return Boolean(req.session) && typeof req.session === "object";
}

// One cookie from the Cookie header, without cookie-parser.
function cookieValue(req, name) {
  const header = req.headers && req.headers.cookie;
  if (typeof header !== "string") return null;
  for (const part of header.split(";")) {
    const at = part.indexOf("=");
    if (at < 0 || part.slice(0, at).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(at + 1).trim());
    } catch (_ignored) {
      return null;
    }
  }
  return null;
}

/**
 * Your user's answers to a run's questions, from renderQuestion's forms, a record field's search,
 * and renderRunStatus's buttons:
 *   POST /qube/questions/runs/:id         a choice, with its fields
 *   GET  /qube/questions/runs/:id/search  a record field's matches, as JSON
 *   POST /qube/runs/:id/retry_start       a start QuBe Sync never confirmed, sent again
 *   POST /qube/runs/:id/redeliver         a stuck run's latest event, sent again
 * Mount it behind your sign-in and your CSRF protection. authorizeQuestion decides who may (404
 * otherwise). What can't go through redirects back with a message for takeError. options.limit:
 * the biggest form taken (default Express's 100 kb).
 */
function questions(options) {
  const express = loadExpress();
  const { limit } = routerOptions("questions", options);
  const router = express.Router();
  const form = express.urlencoded(limit === undefined ? { extended: false } : { extended: false, limit });

  router.post(
    "/qube/questions/runs/:id",
    form,
    handler(async (req, res) => {
      send(req, res, await kit.answerQuestion({ runId: req.params.id, form: req.body || {}, request: req }));
    })
  );

  router.get(
    "/qube/questions/runs/:id/search",
    handler(async (req, res) => {
      const { status, json } = await kit.searchQuestion({ runId: req.params.id, field: req.query.field, q: req.query.q, request: req });
      res.status(status).json(json);
    })
  );

  router.post(
    "/qube/runs/:id/retry_start",
    handler(async (req, res) => {
      send(req, res, await kit.retryStart({ runId: req.params.id, request: req }));
    })
  );

  router.post(
    "/qube/runs/:id/redeliver",
    handler(async (req, res) => {
      send(req, res, await kit.redeliver({ runId: req.params.id, request: req }));
    })
  );
  return router;
}

/**
 * Back to the page the request came from (303), with error, if any, kept for takeError: for your
 * own routes, such as a start button's.
 */
function redirectBack(req, res, error = null) {
  return send(req, res, { status: 303, error });
}

// The page the request came from, when it's this app's; else /.
function back(req) {
  const referer = req.get("Referer");
  try {
    if (referer && new URL(referer, `http://${req.get("Host")}`).host === req.get("Host")) return referer;
  } catch (_ignored) {
    // not a URL
  }
  return "/";
}

module.exports = { webhooks, connect, questions, takeError, redirectBack };
