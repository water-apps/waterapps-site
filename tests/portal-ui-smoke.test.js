const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const PORTAL_LOGIN_PATH = path.join(__dirname, "..", "portal-login.html");
const PORTAL_AUTH_CONFIG_PATH = path.join(__dirname, "..", "scripts", "portal-auth-config.js");

const portalLoginHtml = fs.readFileSync(PORTAL_LOGIN_PATH, "utf8");
const portalAuthConfig = fs.readFileSync(PORTAL_AUTH_CONFIG_PATH, "utf8");

test("portal login page exposes SSO and fallback controls", () => {
    assert.match(portalLoginHtml, /id="cognitoPrimaryBtn"/);
    assert.match(portalLoginHtml, /id="passwordLoginSubmitBtn"/);
    assert.match(portalLoginHtml, /id="loginDiagnostics"/);
    assert.match(portalLoginHtml, /varun@waterapps\.com\.au/);
});

test("portal login page documents current fallback instructions", () => {
    assert.match(portalLoginHtml, /Temporary fallback login is enabled/);
    assert.match(portalLoginHtml, /Waterapps1234/);
    assert.match(portalLoginHtml, /Continue With Cognito/);
});

test("portal auth config pins canonical production callback URLs", () => {
    assert.match(portalAuthConfig, /redirectUri:\s*"https:\/\/www\.waterapps\.com\.au\/portal-login\.html"/);
    assert.match(portalAuthConfig, /logoutRedirectUri:\s*"https:\/\/www\.waterapps\.com\.au\/portal-login\.html"/);
    assert.match(portalAuthConfig, /allowPreviewPasswordLoginOnProduction:\s*true/);
});
