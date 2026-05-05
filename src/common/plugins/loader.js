export async function loadUsageDashboard() {
  try {
    // webpack won't try to resolve this at build time
    /*eslint no-undef: 0*/
    const mod = await import(/* webpackIgnore: true */ "ocl-analytics-web");
    /*eslint no-console: 0*/
    return mod.UsageDashboard || mod.default || null;
  } catch (e) {
    return null;
  }
}
