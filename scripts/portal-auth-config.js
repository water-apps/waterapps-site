const isWaterAppsProductionHost = /^(www\.)?waterapps\.com\.au$/i.test(window.location.hostname);

window.WATERAPPS_PORTAL_AUTH_CONFIG = {
    enabled: true,
    googleLoginEnabled: false,
    cognitoDomain: "https://waterapps-production-portal.auth.ap-southeast-2.amazoncognito.com",
    appClientId: "82lu2ao83rcqvjbcbnmcfbe3e",
    redirectUri: window.location.origin + "/portal-login.html",
    logoutRedirectUri: window.location.origin + "/portal-login.html",
    scopes: ["openid", "email", "profile"],
    postLoginRedirectPath: "/management-dashboard.html",
    previewPasswordLoginEnabled: !isWaterAppsProductionHost,
    previewAllowedEmailDomains: ["waterapps.com.au"],
    previewSessionHours: 12,
    allowPreviewPasswordLoginOnProduction: false
};
