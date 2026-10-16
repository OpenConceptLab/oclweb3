async function loadPrivateExport(name) {
  try {
    // webpack won't try to resolve this at build time
    /*eslint no-undef: 0*/
    const mod = await import("ocl-analytics-web");
    return mod[name] || null;
  } catch (e) {
    return null;
  }
}

export function loadUsageDashboard() {
  return loadPrivateExport("UsageDashboard");
}

// A component the private package renders under the name on a user's profile, or null without the package
export function loadUserProfileExtension() {
  return loadPrivateExport("UserProfileExtension");
}
