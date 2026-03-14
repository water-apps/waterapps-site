(function () {
    var form = document.getElementById("portalLoginForm");
    var message = document.getElementById("formMessage");
    var ssoPrimaryPanel = document.getElementById("ssoPrimaryPanel");
    var cognitoPrimaryBtn = document.getElementById("cognitoPrimaryBtn");
    var secondaryAuthOptions = document.getElementById("secondaryAuthOptions");
    var passwordLoginFields = document.getElementById("passwordLoginFields");
    var passwordLoginSubmitBtn = document.getElementById("passwordLoginSubmitBtn");
    var cognitoLoginBtn = document.getElementById("cognitoLoginBtn");
    var googleLoginBtn = document.getElementById("googleLoginBtn");
    var diagHost = document.getElementById("diagHost");
    var diagCognito = document.getElementById("diagCognito");
    var diagRedirect = document.getElementById("diagRedirect");
    var diagFallback = document.getElementById("diagFallback");
    var diagError = document.getElementById("diagError");

    if (!form || !message) {
        return;
    }

    function showMessage(type, html) {
        var styles = {
            error: "message border border-red-300/25 bg-red-400/10 text-red-100",
            success: "message border border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
            info: "message border border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
            warn: "message border border-amber-300/25 bg-amber-400/10 text-amber-100"
        };
        message.className = styles[type] || styles.info;
        message.innerHTML = html;
        message.style.display = "block";
    }

    function setPasswordLoginState(enabled) {
        if (!passwordLoginFields) {
            return;
        }

        var controls = passwordLoginFields.querySelectorAll("input, button");
        controls.forEach(function (control) {
            control.disabled = !enabled;
        });

        passwordLoginFields.classList.toggle("hidden", !enabled);
        passwordLoginFields.classList.toggle("opacity-50", !enabled);
        passwordLoginFields.classList.toggle("pointer-events-none", !enabled);

        if (ssoPrimaryPanel) {
            ssoPrimaryPanel.classList.toggle("hidden", enabled);
        }

        if (secondaryAuthOptions) {
            secondaryAuthOptions.classList.toggle("hidden", !enabled);
        }

        if (passwordLoginSubmitBtn) {
            passwordLoginSubmitBtn.innerHTML = enabled
                ? '<i class="fas fa-right-to-bracket mr-2" aria-hidden="true"></i>Sign in to portal'
                : '<i class="fas fa-ban mr-2" aria-hidden="true"></i>Password sign-in disabled';
        }
    }

    function renderDiagnostics(config, lastError) {
        if (diagHost) {
            diagHost.textContent = window.location.hostname;
        }
        if (diagCognito) {
            diagCognito.textContent = window.WaterAppsPortalAuth && window.WaterAppsPortalAuth.isConfigured() ? "configured" : "not configured";
        }
        if (diagRedirect) {
            diagRedirect.textContent = config && config.redirectUri ? config.redirectUri : "not set";
        }
        if (diagFallback) {
            diagFallback.textContent = config && config.previewPasswordLoginEnabled ? "enabled" : "disabled";
        }
        if (diagError) {
            diagError.textContent = lastError || "none";
        }
    }

    function startCognitoLogin() {
        if (!window.WaterAppsPortalAuth || !window.WaterAppsPortalAuth.isConfigured()) {
            showMessage("warn", 'Cognito is not configured yet. Update <code>scripts/portal-auth-config.js</code> first.');
            return;
        }

        window.WaterAppsPortalAuth.startLogin({ postLoginRedirect: "/management-dashboard.html" })
            .catch(function (error) {
                var config = window.WaterAppsPortalAuth.getConfig();
                renderDiagnostics(config, error.message || String(error));
                showMessage("error", "Unable to start Cognito login: " + (error.message || String(error)));
            });
    }

    function startGoogleLogin() {
        if (!window.WaterAppsPortalAuth || !window.WaterAppsPortalAuth.isConfigured()) {
            showMessage("warn", 'Cognito is not configured yet. Update <code>scripts/portal-auth-config.js</code> first.');
            return;
        }

        var config = window.WaterAppsPortalAuth.getConfig();
        if (!config.googleLoginEnabled) {
            showMessage("warn", "Google login is not enabled yet. Enable Google IdP in Cognito first.");
            return;
        }

        window.WaterAppsPortalAuth.startLogin({
            postLoginRedirect: "/management-dashboard.html",
            identityProvider: "Google"
        }).catch(function (error) {
            showMessage("error", "Unable to start Google login: " + (error.message || String(error)));
        });
    }

    async function initPortalLogin() {
        if (!window.WaterAppsPortalAuth) {
            showMessage("error", "Portal auth script failed to load.");
            return;
        }

        var config = window.WaterAppsPortalAuth.getConfig();
        renderDiagnostics(config, null);

        var callbackResult = await window.WaterAppsPortalAuth.handleCallbackIfPresent().catch(function (error) {
            return { handled: true, success: false, error: error.message || String(error) };
        });

        if (callbackResult && callbackResult.handled) {
            if (callbackResult.success) {
                showMessage("success", "Cognito sign-in successful. Redirecting to dashboard...");
                window.location.assign(callbackResult.redirectPath || "management-dashboard.html");
                return;
            }

            renderDiagnostics(config, callbackResult.error || "unknown callback failure");
            showMessage(
                "error",
                "Cognito sign-in failed: " + callbackResult.error +
                '<br><br>Checks: callback URL in Cognito must include <code>https://www.waterapps.com.au/portal-login.html</code>, user must be confirmed, and app client must allow Authorization Code + PKCE.'
            );
            return;
        }

        if (config.previewPasswordLoginEnabled) {
            var domains = (config.previewAllowedEmailDomains || []).join(", ");
            showMessage(
                "info",
                "Cognito SSO is available. Preview password login is enabled only for approved non-production testing hosts" +
                (domains ? ' and domains: <code>' + domains + "</code>." : ".")
            );
            setPasswordLoginState(true);
            return;
        }

        if (window.WaterAppsPortalAuth.isConfigured()) {
            showMessage("info", "Production sign-in uses Cognito SSO. Continue with Cognito to authenticate.");
            setPasswordLoginState(false);
            return;
        }

        showMessage("warn", 'No active authentication method configured. Enable Cognito or preview password login in <code>scripts/portal-auth-config.js</code>.');
        setPasswordLoginState(false);
    }

    if (cognitoLoginBtn) {
        cognitoLoginBtn.addEventListener("click", startCognitoLogin);
    }
    if (cognitoPrimaryBtn) {
        cognitoPrimaryBtn.addEventListener("click", startCognitoLogin);
    }
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", startGoogleLogin);
    }

    form.addEventListener("submit", function (event) {
        var config;
        var email;
        var password;
        var result;
        var domains;

        event.preventDefault();

        if (!window.WaterAppsPortalAuth) {
            showMessage("error", "Portal auth script failed to load.");
            return;
        }

        config = window.WaterAppsPortalAuth.getConfig();
        if (!config.previewPasswordLoginEnabled) {
            if (window.WaterAppsPortalAuth.isConfigured()) {
                startCognitoLogin();
            } else {
                showMessage("warn", "Password sign-in is disabled and Cognito is not fully configured.");
            }
            return;
        }

        email = document.getElementById("email").value.trim();
        password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showMessage("error", "Enter your work email and password.");
            return;
        }

        result = window.WaterAppsPortalAuth.signInWithPassword(email, password);
        if (result && result.success) {
            showMessage("success", "Sign-in successful. Redirecting to dashboard...");
            window.location.assign(result.redirectPath || "management-dashboard.html");
            return;
        }

        if (result && result.reason === "domain_not_allowed") {
            domains = (config.previewAllowedEmailDomains || []).join(", ");
            showMessage("error", "Email domain not allowed for preview login. Allowed domain(s): <code>" + domains + "</code>.");
            return;
        }

        if (result && result.reason === "disabled") {
            if (window.WaterAppsPortalAuth.isConfigured()) {
                startCognitoLogin();
                return;
            }
            showMessage("warn", "Password sign-in is disabled and Cognito is not fully configured.");
            return;
        }

        showMessage("error", "Invalid credentials for preview login. Use an approved WaterApps test account and a password with at least 10 characters.");
    });

    initPortalLogin();
})();
