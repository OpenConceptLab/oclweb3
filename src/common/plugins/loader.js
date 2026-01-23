export async function loadUsageDashboard() {
  try {
    // webpack won't try to resolve this at build time
    // eslint-disable-next-line global-require, import/no-unresolved
    /*eslint no-undef: 0*/
    const mod = await import("ocl-analytics-web");
    /*eslint no-console: 0*/
    return mod.UsageDashboard || mod.default || null;
  } catch (e) {
    return null;
  }
}
