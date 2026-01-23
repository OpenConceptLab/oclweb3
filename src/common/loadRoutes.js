export async function loadRoutes() {
  try {
    // This package exists only in your private deployment
    const mod = require("ocl-analytics-web");

    // Expect the private package to export PremiumRoutes (recommended)
    // return React component that renders <Route .../>
    return mod.Routes || null;
  } catch (e) {
    // Not installed → no premium routes
    return null;
  }
}


export async function loadUsageDashboard() {
  try {
    // webpack won't try to resolve this at build time
    // eslint-disable-next-line global-require, import/no-unresolved
    const mod = require("ocl-analytics-web");
    console.log("ocl-analytics-web keys:", Object.keys(mod));
    return mod.UsageDashboard || mod.default || null;
  } catch (e) {
    return null;
  }
}
