(function () {
    const STORAGE_KEYS = {
        pkceVerifier: "waterapps.portal.pkce_verifier",
        oauthState: "waterapps.portal.oauth_state",
        tokens: "waterapps.portal.tokens",
        postLoginRedirect: "waterapps.portal.post_login_redirect"
    };

    function getConfig() {
        const config = window.WATERAPPS_PORTAL_AUTH_CONFIG || {};
        return {
            enabled: config.enabled === true,
            cognitoDomain: (config.cognitoDomain || "").replace(/\/+$/, ""),
            appClientId: config.appClientId || "",
            redirectUri: config.redirectUri || window.location.origin + "/portal-login.html",
            logoutRedirectUri: config.logoutRedirectUri || window.location.origin + "/portal-login.html",
            scopes: Array.isArray(config.scopes) && config.scopes.length ? config.scopes : ["openid", "email", "profile"],
            postLoginRedirectPath: config.postLoginRedirectPath || "/management-dashboard.html"
        };
    }

    function isConfigured(config) {
        return Boolean(config.enabled && config.cognitoDomain && config.appClientId && config.redirectUri);
    }

    function base64UrlEncode(bytes) {
        let binary = "";
        for (let i = 0; i < bytes.length; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    function randomString(length) {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return base64UrlEncode(bytes);
    }

    async function createPkceChallenge(verifier) {
        const encoder = new TextEncoder();
        const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
        return base64UrlEncode(new Uint8Array(digest));
    }

    function buildUrl(path, query) {
        const url = new URL(path);
        Object.keys(query).forEach(function (key) {
            const value = query[key];
            if (value != null && value !== "") {
                url.searchParams.set(key, value);
            }
        });
        return url.toString();
    }

    function saveTokens(tokenResponse) {
        const now = Math.floor(Date.now() / 1000);
        const record = {
            access_token: tokenResponse.access_token || null,
            id_token: tokenResponse.id_token || null,
            refresh_token: tokenResponse.refresh_token || null,
            token_type: tokenResponse.token_type || "Bearer",
            expires_at: now + Number(tokenResponse.expires_in || 3600)
        };
        sessionStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(record));
        return record;
    }

    function getTokens() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEYS.tokens);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.id_token) {
                return null;
            }
            if (parsed.expires_at && parsed.expires_at <= Math.floor(Date.now() / 1000)) {
                sessionStorage.removeItem(STORAGE_KEYS.tokens);
                return null;
            }
            return parsed;
        } catch (_error) {
            sessionStorage.removeItem(STORAGE_KEYS.tokens);
            return null;
        }
    }

    function clearTokens() {
        sessionStorage.removeItem(STORAGE_KEYS.tokens);
        sessionStorage.removeItem(STORAGE_KEYS.pkceVerifier);
        sessionStorage.removeItem(STORAGE_KEYS.oauthState);
    }

    function decodeJwtPayload(jwt) {
        if (!jwt || jwt.split(".").length < 2) {
            return null;
        }
        try {
            const payload = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
            return JSON.parse(atob(padded));
        } catch (_error) {
            return null;
        }
    }

    function getCurrentUser() {
        const tokens = getTokens();
        if (!tokens) {
            return null;
        }
        const payload = decodeJwtPayload(tokens.id_token);
        return {
            email: payload && (payload.email || payload["cognito:username"]) ? (payload.email || payload["cognito:username"]) : "Authenticated User",
            payload: payload || {}
        };
    }

    async function startLogin(options) {
        const config = getConfig();
        if (!isConfigured(config)) {
            throw new Error("Cognito is not configured yet. Update scripts/portal-auth-config.js and enable it.");
        }

        const verifier = randomString(48);
        const challenge = await createPkceChallenge(verifier);
        const state = randomString(24);
        const postLoginRedirect = options && options.postLoginRedirect ? options.postLoginRedirect : config.postLoginRedirectPath;

        sessionStorage.setItem(STORAGE_KEYS.pkceVerifier, verifier);
        sessionStorage.setItem(STORAGE_KEYS.oauthState, state);
        sessionStorage.setItem(STORAGE_KEYS.postLoginRedirect, postLoginRedirect);

        const authorizeUrl = buildUrl(config.cognitoDomain + "/oauth2/authorize", {
            client_id: config.appClientId,
            response_type: "code",
            scope: config.scopes.join(" "),
            redirect_uri: config.redirectUri,
            state: state,
            code_challenge_method: "S256",
            code_challenge: challenge
        });

        window.location.assign(authorizeUrl);
    }

    async function exchangeCodeForTokens(code) {
        const config = getConfig();
        const verifier = sessionStorage.getItem(STORAGE_KEYS.pkceVerifier);
        if (!verifier) {
            throw new Error("Missing PKCE verifier in session. Start login again.");
        }

        const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: config.appClientId,
            code: code,
            redirect_uri: config.redirectUri,
            code_verifier: verifier
        });

        const response = await fetch(config.cognitoDomain + "/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString()
        });

        if (!response.ok) {
            let details = "";
            try {
                details = JSON.stringify(await response.json());
            } catch (_error) {
                details = await response.text();
            }
            throw new Error("Token exchange failed: " + response.status + " " + details);
        }

        return saveTokens(await response.json());
    }

    async function handleCallbackIfPresent() {
        const config = getConfig();
        if (!isConfigured(config)) {
            return { handled: false };
        }

        const url = new URL(window.location.href);
        const error = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");
        if (error) {
            return { handled: true, success: false, error: error + (errorDescription ? ": " + decodeURIComponent(errorDescription) : "") };
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code) {
            return { handled: false };
        }

        const expectedState = sessionStorage.getItem(STORAGE_KEYS.oauthState);
        if (!expectedState || expectedState !== state) {
            return { handled: true, success: false, error: "Invalid or missing OAuth state. Start login again." };
        }

        await exchangeCodeForTokens(code);
        sessionStorage.removeItem(STORAGE_KEYS.oauthState);
        sessionStorage.removeItem(STORAGE_KEYS.pkceVerifier);

        const postLoginRedirect = sessionStorage.getItem(STORAGE_KEYS.postLoginRedirect) || config.postLoginRedirectPath;
        sessionStorage.removeItem(STORAGE_KEYS.postLoginRedirect);

        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.searchParams.delete("error");
        url.searchParams.delete("error_description");
        window.history.replaceState({}, document.title, url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "") + url.hash);

        return { handled: true, success: true, redirectPath: postLoginRedirect };
    }

    function signOut() {
        const config = getConfig();
        clearTokens();
        if (!isConfigured(config)) {
            window.location.assign("portal-login.html");
            return;
        }
        const logoutUrl = buildUrl(config.cognitoDomain + "/logout", {
            client_id: config.appClientId,
            logout_uri: config.logoutRedirectUri
        });
        window.location.assign(logoutUrl);
    }

    function requireAuth(options) {
        const config = getConfig();
        if (!isConfigured(config)) {
            return { allowed: true, reason: "cognito_disabled" };
        }
        if (getTokens()) {
            return { allowed: true, reason: "authenticated" };
        }
        const redirectTarget = (options && options.redirectTarget) || (window.location.pathname + window.location.hash);
        sessionStorage.setItem(STORAGE_KEYS.postLoginRedirect, redirectTarget);
        window.location.assign("portal-login.html");
        return { allowed: false, reason: "redirected_to_login" };
    }

    window.WaterAppsPortalAuth = {
        getConfig: getConfig,
        isConfigured: function () {
            return isConfigured(getConfig());
        },
        startLogin: startLogin,
        handleCallbackIfPresent: handleCallbackIfPresent,
        getTokens: getTokens,
        getCurrentUser: getCurrentUser,
        signOut: signOut,
        requireAuth: requireAuth,
        clearTokens: clearTokens
    };
})();
