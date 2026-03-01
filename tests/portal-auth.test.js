const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { webcrypto } = require("node:crypto");
const { TextEncoder } = require("node:util");

const SCRIPT_PATH = path.join(__dirname, "..", "scripts", "portal-auth.js");
const PORTAL_AUTH_SOURCE = fs.readFileSync(SCRIPT_PATH, "utf8");

class MemoryStorage {
    constructor(initialData) {
        this.data = new Map(Object.entries(initialData || {}));
    }

    getItem(key) {
        return this.data.has(key) ? this.data.get(key) : null;
    }

    setItem(key, value) {
        this.data.set(key, String(value));
    }

    removeItem(key) {
        this.data.delete(key);
    }

    clear() {
        this.data.clear();
    }
}

function encodeBase64Url(value) {
    return Buffer.from(value, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function makeJwt(payload) {
    const header = encodeBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const body = encodeBase64Url(JSON.stringify(payload));
    return `${header}.${body}.signature`;
}

function createHarness(options) {
    const assignedUrls = [];
    const historyCalls = [];
    const fetchCalls = [];
    const initialUrl = new URL(options.href || "https://www.waterapps.com.au/portal-login.html");
    let currentUrl = initialUrl;

    const location = {
        get href() {
            return currentUrl.toString();
        },
        set href(value) {
            currentUrl = new URL(value, currentUrl.toString());
        },
        get origin() {
            return currentUrl.origin;
        },
        get pathname() {
            return currentUrl.pathname;
        },
        get hash() {
            return currentUrl.hash;
        },
        assign(value) {
            assignedUrls.push(value);
            this.href = value;
        }
    };

    const sessionStorage = new MemoryStorage(options.initialSession);
    const windowObject = {
        WATERAPPS_PORTAL_AUTH_CONFIG: options.config || {},
        location: location,
        history: {
            replaceState(_state, _title, nextUrl) {
                if (typeof nextUrl === "string" && nextUrl.length > 0) {
                    currentUrl = new URL(nextUrl, currentUrl.toString());
                }
                const args = Array.from(arguments);
                historyCalls.push(args);
            }
        }
    };

    const context = {
        URL,
        URLSearchParams,
        TextEncoder,
        crypto: webcrypto,
        window: windowObject,
        sessionStorage: sessionStorage,
        document: { title: "Portal Login" },
        atob(value) {
            return Buffer.from(value, "base64").toString("binary");
        },
        btoa(value) {
            return Buffer.from(value, "binary").toString("base64");
        },
        fetch: async (...args) => {
            fetchCalls.push(args);
            if (options.fetchImpl) {
                return options.fetchImpl(...args);
            }
            throw new Error("Unexpected fetch call in test harness.");
        }
    };

    vm.createContext(context);
    vm.runInContext(PORTAL_AUTH_SOURCE, context, { filename: "portal-auth.js" });

    return {
        auth: context.window.WaterAppsPortalAuth,
        sessionStorage,
        assignedUrls,
        historyCalls,
        fetchCalls,
        getLocationHref() {
            return location.href;
        }
    };
}

const CONFIGURED_PORTAL = {
    enabled: true,
    cognitoDomain: "https://waterapps-production-portal.auth.ap-southeast-2.amazoncognito.com",
    appClientId: "client-id-123",
    redirectUri: "https://www.waterapps.com.au/portal-login.html",
    logoutRedirectUri: "https://www.waterapps.com.au/portal-login.html",
    scopes: ["openid", "email", "profile"],
    postLoginRedirectPath: "/management-dashboard.html",
    previewPasswordLoginEnabled: true,
    previewAllowedEmailDomains: ["waterapps.com.au"],
    previewSessionHours: 12
};

test("startLogin throws when Cognito is not configured", async () => {
    const harness = createHarness({
        config: {
            enabled: false
        }
    });

    await assert.rejects(
        harness.auth.startLogin(),
        /Cognito is not configured yet/
    );
});

test("startLogin builds authorize URL and stores PKCE/session state", async () => {
    const harness = createHarness({ config: CONFIGURED_PORTAL });
    await harness.auth.startLogin({ postLoginRedirect: "/dashboard" });

    assert.equal(harness.assignedUrls.length, 1);
    const authUrl = new URL(harness.assignedUrls[0]);
    const storedState = harness.sessionStorage.getItem("waterapps.portal.oauth_state");
    const storedVerifier = harness.sessionStorage.getItem("waterapps.portal.pkce_verifier");

    assert.equal(authUrl.pathname, "/oauth2/authorize");
    assert.equal(authUrl.searchParams.get("client_id"), CONFIGURED_PORTAL.appClientId);
    assert.equal(authUrl.searchParams.get("redirect_uri"), CONFIGURED_PORTAL.redirectUri);
    assert.equal(authUrl.searchParams.get("code_challenge_method"), "S256");
    assert.equal(authUrl.searchParams.get("state"), storedState);
    assert.ok(storedVerifier);
    assert.equal(harness.sessionStorage.getItem("waterapps.portal.post_login_redirect"), "/dashboard");
});

test("handleCallbackIfPresent returns state mismatch error without token exchange", async () => {
    const harness = createHarness({
        config: CONFIGURED_PORTAL,
        href: "https://www.waterapps.com.au/portal-login.html?code=abc123&state=wrong-state",
        initialSession: {
            "waterapps.portal.oauth_state": "expected-state",
            "waterapps.portal.pkce_verifier": "pkce-verifier"
        }
    });

    const result = await harness.auth.handleCallbackIfPresent();

    assert.equal(result.handled, true);
    assert.equal(result.success, false);
    assert.equal(result.error, "Invalid or missing OAuth state. Start login again.");
    assert.equal(harness.fetchCalls.length, 0);
});

test("handleCallbackIfPresent exchanges code, stores tokens, and cleans callback URL", async () => {
    const jwt = makeJwt({ email: "architect@waterapps.com.au" });
    let postedBody;
    const harness = createHarness({
        config: CONFIGURED_PORTAL,
        href: "https://www.waterapps.com.au/portal-login.html?code=auth-code-001&state=expected-state",
        initialSession: {
            "waterapps.portal.oauth_state": "expected-state",
            "waterapps.portal.pkce_verifier": "pkce-verifier",
            "waterapps.portal.post_login_redirect": "/management-dashboard.html"
        },
        fetchImpl: async (_url, init) => {
            postedBody = new URLSearchParams(init.body);
            return {
                ok: true,
                async json() {
                    return {
                        access_token: "access-token",
                        id_token: jwt,
                        refresh_token: "refresh-token",
                        token_type: "Bearer",
                        expires_in: 3600
                    };
                }
            };
        }
    });

    const result = await harness.auth.handleCallbackIfPresent();
    const tokenRecord = JSON.parse(harness.sessionStorage.getItem("waterapps.portal.tokens"));

    assert.equal(result.handled, true);
    assert.equal(result.success, true);
    assert.equal(result.redirectPath, "/management-dashboard.html");
    assert.equal(postedBody.get("grant_type"), "authorization_code");
    assert.equal(postedBody.get("client_id"), CONFIGURED_PORTAL.appClientId);
    assert.equal(postedBody.get("code"), "auth-code-001");
    assert.equal(postedBody.get("code_verifier"), "pkce-verifier");
    assert.equal(harness.sessionStorage.getItem("waterapps.portal.oauth_state"), null);
    assert.equal(harness.sessionStorage.getItem("waterapps.portal.pkce_verifier"), null);
    assert.equal(harness.sessionStorage.getItem("waterapps.portal.post_login_redirect"), null);
    assert.equal(tokenRecord.id_token, jwt);
    assert.equal(harness.historyCalls.length, 1);
    assert.ok(!harness.getLocationHref().includes("code=auth-code-001"));
});

test("requireAuth redirects to login when no valid token exists", () => {
    const harness = createHarness({ config: CONFIGURED_PORTAL });
    const result = harness.auth.requireAuth({ redirectTarget: "/management-dashboard.html" });

    assert.equal(result.allowed, false);
    assert.equal(result.reason, "redirected_to_login");
    assert.equal(harness.assignedUrls[0], "portal-login.html");
    assert.equal(
        harness.sessionStorage.getItem("waterapps.portal.post_login_redirect"),
        "/management-dashboard.html"
    );
});

test("getCurrentUser returns decoded email from stored id_token", () => {
    const jwt = makeJwt({ email: "principal.engineer@waterapps.com.au" });
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const harness = createHarness({
        config: CONFIGURED_PORTAL,
        initialSession: {
            "waterapps.portal.tokens": JSON.stringify({
                id_token: jwt,
                access_token: "access-token",
                expires_at: expiresAt
            })
        }
    });

    const user = harness.auth.getCurrentUser();

    assert.equal(user.email, "principal.engineer@waterapps.com.au");
    assert.equal(user.payload.email, "principal.engineer@waterapps.com.au");
});

test("signInWithPassword stores preview token for allowed domain", () => {
    const harness = createHarness({ config: CONFIGURED_PORTAL });
    const result = harness.auth.signInWithPassword("Varun@waterapps.com.au", "StrongPassword123");

    assert.equal(result.success, true);
    assert.equal(result.email, "varun@waterapps.com.au");
    assert.equal(result.redirectPath, "/management-dashboard.html");

    const tokens = harness.auth.getTokens();
    assert.ok(tokens);
    assert.ok(tokens.id_token);

    const user = harness.auth.getCurrentUser();
    assert.equal(user.email, "varun@waterapps.com.au");
    assert.equal(user.payload.auth_mode, "preview_password");
});

test("signInWithPassword rejects non-allowed domain", () => {
    const harness = createHarness({ config: CONFIGURED_PORTAL });
    const result = harness.auth.signInWithPassword("test@example.com", "StrongPassword123");

    assert.equal(result.success, false);
    assert.equal(result.reason, "domain_not_allowed");
    assert.equal(harness.auth.getTokens(), null);
});
