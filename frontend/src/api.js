// The dev server adds the AA key; credentials never enter the browser bundle.
export async function api(service, path, { method = "GET", body, query } = {}) {
  const url = `/api/${service}${path}${query ? "?" + new URLSearchParams(query) : ""}`;
  let accessToken = null;
  if (service === "aa") {
    try {
      accessToken = JSON.parse(sessionStorage.getItem("cc-session") || "null")?.accessToken;
    } catch {
      accessToken = null;
    }
  }
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error(
      "The service could not be reached. Check that both services are running and try again.",
    );
  }
  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  if (!response.ok || data?.success === false || data?.verified === false)
    throw new Error(
      data?.message ||
        data?.error ||
        (typeof data === "string" && data) ||
        `Request failed (${response.status})`,
    );
  return data;
}
export function parseData(value) {
  if (typeof value === "string") {
    try {
      return parseData(JSON.parse(value));
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map(parseData);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([k]) => !["password", "netbankingPassword", "user"].includes(k),
        )
        .map(([k, v]) => [k, parseData(v)]),
    );
  return value;
}
export const scopes = ["ACCOUNT", "TRANSACTIONS", "LOANS"];
export const scopeNames = {
  ACCOUNT: "Account details",
  TRANSACTIONS: "Transactions",
  LOANS: "Loan history",
};
export function storedIds(role, user) {
  try {
    return JSON.parse(
      localStorage.getItem(`cc-requests-${role}-${user}`) || "[]",
    );
  } catch {
    return [];
  }
}
export function rememberId(role, user, id) {
  const ids = [...new Set([id, ...storedIds(role, user)])];
  localStorage.setItem(`cc-requests-${role}-${user}`, JSON.stringify(ids));
}
