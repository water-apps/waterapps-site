window.WATERAPPS_PORTAL_AUTH_CONFIG = {
    enabled: true,
    cognitoDomain: "https://waterapps-production-portal.auth.ap-southeast-2.amazoncognito.com",
    appClientId: "82lu2ao83rcqvjbcbnmcfbe3e",
    redirectUri: "https://www.waterapps.com.au/portal-login.html",
    logoutRedirectUri: "https://www.waterapps.com.au/portal-login.html",
    scopes: ["openid", "email", "profile"],
    postLoginRedirectPath: "/management-dashboard.html"
};
