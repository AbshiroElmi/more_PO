const BASE = "http://localhost:5000";

/**
 * One common fetch for the whole app.
 *
 * Data CRUD:
 *   fetchData("people")
 *   fetchData("people", { method: "POST", body })
 *   fetchData("people", { method: "PUT", id, body })
 *   fetchData("people", { method: "DELETE", id })
 *
 * Other routes (path starts with /):
 *   fetchData("/tables", { method: "POST", body: { tablename } })
 *   fetchData("/login", { method: "POST", body })
 *   fetchData("/dashboard/stats")
 */
export async function fetchData(tableOrPath, { method = "GET", id, body } = {}) {
  let url;
  if (typeof tableOrPath === "string" && tableOrPath.startsWith("/")) {
    url = `${BASE}${tableOrPath}`;
  } else {
    url = id != null ? `${BASE}/data/${tableOrPath}/${id}` : `${BASE}/data/${tableOrPath}`;
  }

  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
}

export default fetchData;
