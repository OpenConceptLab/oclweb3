export async function loadUsageDashboard() {
  try {
    // webpack won't try to resolve this at build time
    /*eslint no-undef: 0*/
    const mod = await import("ocl-analytics-web");
    /*eslint no-console: 0*/
    return mod.UsageDashboard || mod.default || null;
  } catch (e) {
    return null;
  }
}

// A component the private package renders under the name on a user's profile, or null without the package
export async function loadUserProfileExtension() {
  try {
    /*eslint no-undef: 0*/
    const mod = await import("ocl-analytics-web");
    return mod.UserProfileExtension || null;
  } catch (e) {
    return null;
  }
}
