import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  FileText,
  Landmark,
  History,
  LogOut,
  Plus,
  Search,
  RefreshCw,
  Check,
  Link2,
  Database,
  ChevronRight,
  Activity,
  Menu,
  X,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import {
  api,
  parseData,
  scopes,
  scopeNames,
  storedIds,
  rememberId,
} from "./api";
import "./styles.css";
const roles = {
  aa: {
    label: "Account Aggregator",
    short: "AA",
    tag: "Personal data workspace",
    title: "Your data. Your decision.",
    description:
      "Connect your accounts, review every request, and stay in control of what you share.",
  },
  fiu: {
    label: "Financial Information User",
    short: "FIU",
    tag: "Institution workspace",
    title: "Better decisions start here.",
    description:
      "Request the financial information you need, with customer consent at every step.",
  },
  fip: {
    label: "Financial Information Provider",
    short: "FIP",
    tag: "Bank operations workspace",
    title: "Share with confidence.",
    description:
      "Validate consent and provide financial information through one connected workspace.",
  },
};
const money = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(v || 0));
const date = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const nice = (s) =>
  String(s || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
function Badge({ value }) {
  return (
    <span
      className={
        "badge " +
        (/ACTIVE|APPROVED|RECEIVED|LINKED/.test(value)
          ? "good"
          : /REJECT|REVOK|EXPIRE/.test(value)
            ? "bad"
            : "pending")
      }
    >
      <i />
      {nice(value)}
    </span>
  );
}
function Empty({
  title = "Nothing here yet",
  text = "New activity will appear here.",
  action,
}) {
  return (
    <div className="empty">
      <FileText size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = true,
  ...props
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
    </label>
  );
}
function Form({ children, onSubmit, button = "Continue", className = "" }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
          await onSubmit(Object.fromEntries(new FormData(e.currentTarget)));
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "Please wait…" : button}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Link2 size={23} />
      </span>
      Consent<span>Chain</span>
    </div>
  );
}
function Auth({ onLogin }) {
  const { role = "aa" } = useParams(),
    [register, setRegister] = useState(false);
  const r = roles[role] || roles.aa;
  return (
    <div className={"auth theme-" + role}>
      <div className="auth-story">
        <Brand />
        <div>
          <span className="eyebrow">CONNECTED FINANCE, WITH CONSENT</span>
          <h1>{r.title}</h1>
          <p>{r.description}</p>
          <div className="orbit">
            <div className="orbit-center">
              <ShieldCheck size={42} />
              <strong>You are in control</strong>
              <small>Consent connects everything</small>
            </div>
            <span className="orbit-node n1">
              <Landmark /> Your bank
            </span>
            <span className="orbit-node n2">
              <Users /> Requesting institution
            </span>
            <span className="orbit-node n3">
              <CheckCircle2 /> Your permission
            </span>
          </div>
        </div>
        <small>ConsentChain · Local demonstration environment</small>
      </div>
      <div className="auth-content">
        <div className="role-tabs">
          {Object.entries(roles).map(([k, v]) => (
            <Link
              key={k}
              className={k === role ? "active" : ""}
              to={"/" + k + "/login"}
              onClick={() => setRegister(false)}
            >
              {v.short}
            </Link>
          ))}
        </div>
        <div className="auth-form">
          <span className="eyebrow">{r.tag}</span>
          <h2>{register ? "Create your account" : "Welcome back"}</h2>
          <p>
            {register
              ? "Start your consent-driven journey."
              : `Sign in to your ${r.short} portal.`}
          </p>
          <Form
            key={role + register}
            button={register ? "Create account" : "Sign in"}
            onSubmit={async (values) => {
              const service = role === "aa" ? "aa" : "bank",
                base = role === "aa" ? "/aa/auth" : "/auth";
              if (register) {
                await api(service, base + "/register", {
                  method: "POST",
                  body: values,
                });
                setRegister(false);
                return;
              }
              const u = await api(service, base + "/login", {
                method: "POST",
                body: values,
              });
              if (role !== "aa" && u.role !== role.toUpperCase())
                throw Error(`This account belongs to the ${u.role} portal.`);
              onLogin({ ...u, portal: role });
            }}
          >
            {register && (
              <>
                <Field label="Full name" name="name" autoComplete="name" />
                <Field
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <div className="form-grid">
                  <Field
                    label="Mobile number"
                    name="mobile"
                    pattern="[0-9]{10}"
                  />
                  <Field
                    label="PAN"
                    name="panNumber"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  />
                </div>
              </>
            )}
            {role !== "aa" && (
              <Field
                label="Institution ID"
                name="institutionId"
                placeholder={"BANK-" + role.toUpperCase() + "-001"}
              />
            )}
            <Field label="Username" name="username" autoComplete="username" />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
            />
          </Form>
          {role === "aa" && (
            <button
              className="text-button"
              onClick={() => setRegister(!register)}
            >
              {register
                ? "Already have an account? Sign in"
                : "New to ConsentChain? Create an account"}
            </button>
          )}
          <div className="auth-note">
            <ShieldCheck size={19} />
            <span>
              {role === "aa"
                ? "Review the purpose, period, and data requested before sharing."
                : "Institution access. Use your portal credentials, not customer netbanking credentials."}
            </span>
          </div>
        </div>
        <small className="auth-footer">
          Purpose-led sharing. Clear permissions. Connected accounts.
        </small>
      </div>
    </div>
  );
}
function useResource(loader, deps = []) {
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await loader());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { data, loading, error, refresh };
}
function Resource({ resource, children }) {
  if (resource.loading)
    return (
      <div className="loading" role="status">
        <RefreshCw className="spin" /> Loading your workspace…
      </div>
    );
  if (resource.error)
    return (
      <div className="alert error" role="alert">
        {resource.error}
        <button onClick={resource.refresh}>Try again</button>
      </div>
    );
  return children(resource.data);
}
function Section({ title, sub, action, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function RequestTable({ rows, role }) {
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("");
  const filtered = rows.filter(
    (r) =>
      JSON.stringify([r.requestId, r.purpose, r.status, r.customerPan])
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!status || r.status === status),
  );
  return (
    <>
      <div className="table-tools">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search requests"
            placeholder="Search by request ID or purpose…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {[...new Set(rows.map((r) => r.status))].map((s) => (
            <option key={s} value={s}>
              {nice(s)}
            </option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request / purpose</th>
                <th>Data period</th>
                <th>Data requested</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.requestId}>
                  <td>
                    <Link
                      className="id-link"
                      to={`/${role}/requests/${r.requestId}`}
                    >
                      {r.requestId}
                    </Link>
                    <small>{r.purpose}</small>
                  </td>
                  <td>
                    {date(r.fromDate)}
                    <small>to {date(r.toDate)}</small>
                  </td>
                  <td>
                    <span>
                      {(Array.isArray(r.dataScopes)
                        ? r.dataScopes
                        : (r.dataScopes || r.dataScope || "").split(",")
                      )
                        .map((s) => scopeNames[s] || s)
                        .join(" · ")}
                    </span>
                  </td>
                  <td>
                    <Badge value={r.status} />
                    {r.consentStatus && (
                      <small>Consent: {nice(r.consentStatus)}</small>
                    )}
                  </td>
                  <td>
                    <Link
                      aria-label={"View " + r.requestId}
                      className="icon-link"
                      to={`/${role}/requests/${r.requestId}`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={rows.length ? "No matching requests" : "No requests yet"}
          text={
            rows.length
              ? "Try a different search or status."
              : "Create a request or look up an existing request ID to get started."
          }
        />
      )}
    </>
  );
}
function requestStatus(request, aaRequest, consent) {
  // Delivery history remains true even when a permission is later revoked.
  if (request.status === "DATA_RECEIVED") return request.status;
  if (consent?.status === "REVOKED") return "REVOKED";
  if (consent?.status === "ACTIVE" && new Date(consent.expiresAt) <= new Date())
    return "EXPIRED";
  return aaRequest?.status || request.status;
}
async function loadRequests(user) {
  if (user.portal === "aa") {
    const cs = await api("aa", `/aa/consents/user/${user.userId}`);
    const results = await Promise.all(
      cs.map(async (c) => {
        let request;
        try {
          request = await api(
            "aa",
            "/aa/data-requests/" + encodeURIComponent(c.requestId),
          );
        } catch {
          request = c;
        }
        return {
          ...request,
          status: requestStatus(request, request, c),
          consentStatus: c.status,
        };
      }),
    );
    return results.reverse();
  }
  return Promise.all(
    storedIds(user.portal, user.userId).map(async (id) => {
      const request = await api(
        "bank",
        "/fiu/data-request/" + encodeURIComponent(id),
      );
      try {
        const aaRequest = await api(
          "aa",
          "/aa/data-requests/" + encodeURIComponent(id),
        );
        const consent = await api(
          "aa",
          "/aa/consents/" + encodeURIComponent(aaRequest.consentId),
        );
        return {
          ...request,
          status: requestStatus(request, aaRequest, consent),
          consentStatus: consent.status,
        };
      } catch {
        return { ...request, consentStatus: "UNAVAILABLE" };
      }
    }),
  );
}
function Dashboard({ user }) {
  const role = user.portal,
    r = roles[role];
  const resource = useResource(
    async () => ({
      requests: await loadRequests(user),
      accounts:
        role === "aa" ? await api("aa", "/aa/accounts/" + user.userId) : null,
    }),
    [role, user.userId],
  );
  return (
    <Resource resource={resource}>
      {({ requests, accounts }) => (
        <>
          <div className="welcome">
            <div>
              <span className="eyebrow">YOUR {r.short} WORKSPACE</span>
              <h1>
                {role === "aa"
                  ? `Hello, ${(user.name || user.username).split(" ")[0]}.`
                  : "A clearer view of your activity."}
              </h1>
              <p>
                {role === "aa"
                  ? "Your financial data stays in your hands. Make every permission count."
                  : "Manage requests, follow consent, and keep information moving."}
              </p>
              <Link
                className="primary"
                to={`/${role}/${role === "fip" ? "requests" : "create"}`}
              >
                {role === "fip" ? "Look up a request" : "Create data request"}
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="welcome-art">
              <ShieldCheck size={57} />
              <span>Connected by consent</span>
              <small>Every request starts with permission</small>
            </div>
          </div>
          <div className="stats">
            {[
              [FileText, "Tracked requests", requests.length],
              [
                Clock,
                "Awaiting consent",
                requests.filter((x) => /PENDING|REQUIRED/.test(x.status))
                  .length,
              ],
              [
                CheckCircle2,
                "Data received",
                requests.filter((x) => x.status === "DATA_RECEIVED").length,
              ],
              [
                role === "aa" ? Landmark : Activity,
                role === "aa" ? "Linked accounts" : "Approved requests",
                role === "aa"
                  ? accounts.length
                  : requests.filter((x) => /APPROVED|ACTIVE/.test(x.status))
                      .length,
              ],
            ].map(([Icon, label, value]) => (
              <div className="stat" key={label}>
                <span className="stat-icon">
                  <Icon size={19} />
                </span>
                <p>{label}</p>
                <strong>{value}</strong>
                <small>
                  {role === "aa"
                    ? "From your account"
                    : "Tracked in this browser"}
                </small>
              </div>
            ))}
          </div>
          <Section
            title="Recent requests"
            sub="Your latest consent and data activity"
            action={
              <Link className="text-link" to={`/${role}/requests`}>
                View all <ArrowRight size={15} />
              </Link>
            }
          >
            <RequestTable rows={requests.slice(0, 5)} role={role} />
          </Section>
          <div className="steps">
            <span>
              <b>01</b> Request information
            </span>
            <ChevronRight />
            <span>
              <b>02</b> Customer reviews consent
            </span>
            <ChevronRight />
            <span>
              <b>03</b> Share authorized data
            </span>
          </div>
        </>
      )}
    </Resource>
  );
}
function Requests({ user, history = false, received = false }) {
  const navigate = useNavigate();
  const resource = useResource(
    () => loadRequests(user),
    [user.portal, user.userId],
  );
  return (
    <>
      <PageTitle
        title={
          received
            ? "Received data"
            : history
              ? "Request history"
              : "Data requests"
        }
        text="Follow each request from consent to delivery."
        action={
          <button className="secondary" onClick={resource.refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />
      {user.portal !== "aa" && (
        <Section
          title="Find an existing request"
          sub="This API supports lookup by ID. This browser remembers only IDs you create or look up."
        >
          <Form
            className="inline-form"
            button="Find request"
            onSubmit={async ({ requestId }) => {
              const id = requestId.trim();
              await api("bank", "/fiu/data-request/" + encodeURIComponent(id));
              rememberId(user.portal, user.userId, id);
              navigate(`/${user.portal}/requests/${id}`);
            }}
          >
            <Field label="Request ID" name="requestId" placeholder="REQ-…" />
          </Form>
        </Section>
      )}
      <Section title={received ? "Available results" : "Request activity"}>
        <Resource resource={resource}>
          {(rows) => (
            <RequestTable
              rows={
                received
                  ? rows.filter((r) => r.status === "DATA_RECEIVED")
                  : rows
              }
              role={user.portal}
            />
          )}
        </Resource>
      </Section>
    </>
  );
}
function PageTitle({ title, text, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}
function CreateRequest({ user }) {
  const navigate = useNavigate(),
    [selected, setSelected] = useState(["ACCOUNT"]),
    [bankRequest, setBankRequest] = useState(null),
    [pendingValues, setPendingValues] = useState(null);
  return (
    <>
      <PageTitle
        title="Create a data request"
        text="Give customers a clear reason to share their information."
      />
      <div className="two-col">
        <Section
          title="Request details"
          sub="A new request creates a pending consent for the customer to review."
        >
          <Form
            button={bankRequest ? "Retry consent request" : "Send for consent"}
            onSubmit={async (submitted) => {
              const v = pendingValues || submitted;
              if (!selected.length)
                throw Error("Choose at least one data type.");
              if (v.fromDate > v.toDate)
                throw Error("The end date must be after the start date.");
              let b = bankRequest;
              if (!b) {
                b = await api("bank", "/fiu/data-request", {
                  method: "POST",
                  body: {
                    customerPan: v.customerPan,
                    purpose: v.purpose,
                    dataScope: selected.join(","),
                    fromDate: v.fromDate,
                    toDate: v.toDate,
                  },
                });
                setBankRequest(b);
                setPendingValues(v);
                rememberId("fiu", user.userId, b.requestId);
              }
              await api("aa", "/aa/data-requests", {
                method: "POST",
                body: {
                  requestId: b.requestId,
                  userId: user.portal === "aa" ? user.userId : Number(v.userId),
                  customerPan: b.customerPan || v.customerPan,
                  fiuId: user.portal === "fiu" ? user.institutionId : v.fiuId,
                  purpose: b.purpose,
                  dataScopes: b.dataScope.split(","),
                  fromDate: b.fromDate,
                  toDate: b.toDate,
                },
              });
              navigate(`/${user.portal}/requests/${b.requestId}`);
            }}
          >
            <fieldset disabled={!!bankRequest}>
              <div className="form-grid">
                <Field
                  label="Customer PAN"
                  name="customerPan"
                  placeholder="ABCPL1234D"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                />
                {user.portal === "fiu" ? (
                  <Field
                    label="AA customer ID"
                    name="userId"
                    type="number"
                    min="1"
                  />
                ) : (
                  <Field
                    label="Requesting FIU ID"
                    name="fiuId"
                    placeholder="BANK-FIU-001"
                  />
                )}
              </div>
              <Field
                label="Purpose"
                name="purpose"
                placeholder="e.g. Credit assessment"
              />
              <div className="form-grid">
                <Field label="Data period starts" name="fromDate" type="date" />
                <Field label="Data period ends" name="toDate" type="date" />
              </div>
              <div className="field">
                <span>Requested information</span>
                <div className="scope-options">
                  {scopes.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={selected.includes(s)}
                        onChange={() =>
                          setSelected(
                            selected.includes(s)
                              ? selected.filter((x) => x !== s)
                              : [...selected, s],
                          )
                        }
                      />
                      <span>
                        <strong>{scopeNames[s]}</strong>
                        <small>
                          {s === "ACCOUNT"
                            ? "Balance and account information"
                            : s === "TRANSACTIONS"
                              ? "Activity within the requested period"
                              : "Loans linked to the account"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
            {bankRequest && (
              <div className="alert">
                Bank request {bankRequest.requestId} was created. Retry will
                submit that same request to AA.
              </div>
            )}
          </Form>
        </Section>
        <aside className="explain">
          <ShieldCheck size={32} />
          <h2>Permission comes first.</h2>
          <p>
            The customer reviews the purpose, dates, and requested information
            before anything is shared.
          </p>
          <ol>
            <li>Create the request</li>
            <li>Customer approves in AA</li>
            <li>FIP validates the consent</li>
            <li>AA delivers the result to FIU</li>
          </ol>
          <div className="hint">
            The AA customer ID is shown in the customer’s workspace. No customer
            directory is exposed by the FIU API.
          </div>
        </aside>
      </div>
    </>
  );
}
function Confirm({ action, onConfirm, onClose, busy }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [busy, onClose]);
  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <ShieldCheck size={32} />
        <h2 id="confirm-title">{nice(action)} this consent?</h2>
        <p>
          {action === "approve"
            ? "You allow the requested data types to be shared for the stated purpose and period."
            : action === "revoke"
              ? "Future access using this consent will stop. Information already delivered cannot be recalled."
              : "This request will be rejected and cannot be approved later."}
        </p>
        <div className="button-row">
          <button
            autoFocus
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button className="primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Updating…" : `Confirm ${action}`}
          </button>
        </div>
      </div>
    </div>
  );
}
function BlockchainAudit({ consentId }) {
  const resource = useResource(
    () =>
      api(
        "aa",
        `/aa/consents/${encodeURIComponent(consentId)}/blockchain-audit`,
      ),
    [consentId],
  );
  return (
    <Section
      title="Blockchain audit"
      sub="Consent events recorded in the blockchain audit trail."
      action={
        <button className="secondary" onClick={resource.refresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {resource.loading ? (
        <div className="loading" role="status">
          <RefreshCw className="spin" /> Loading blockchain audit…
        </div>
      ) : resource.error ? (
        <div className="alert error" role="alert">
          {resource.error}
          <button onClick={resource.refresh}>Try again</button>
        </div>
      ) : (() => {
          const events = Array.isArray(resource.data)
            ? resource.data
            : Array.isArray(resource.data?.events)
              ? resource.data.events
              : [];
          return events.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Recorded at</th>
                    <th>Transaction hash</th>
                    <th>On-chain verification</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={event.id || event.transactionHash || index}>
                      <td>{event.eventType ?? "—"}</td>
                      <td>{event.status ?? "—"}</td>
                      <td>{event.recordedAt ?? "—"}</td>
                      <td>{event.transactionHash ?? "—"}</td>
                      <td>
                        {event.verifiedOnChain === true
                          ? "Verified"
                          : event.verifiedOnChain === false
                            ? "Not verified"
                            : "—"}
                      </td>
                      <td>{event.message ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No blockchain audit events"
              text="No audit events have been recorded for this consent yet."
            />
          );
        })()}
    </Section>
  );
}
function RequestDetail({ user }) {
  const { id } = useParams(),
    role = user.portal;
  const resource = useResource(async () => {
    const req = await api(
      role === "aa" ? "aa" : "bank",
      role === "aa"
        ? "/aa/data-requests/" + encodeURIComponent(id)
        : "/fiu/data-request/" + encodeURIComponent(id),
    );
    let aa,
      consent,
      aaError = "";
    try {
      aa =
        role === "aa"
          ? req
          : await api("aa", "/aa/data-requests/" + encodeURIComponent(id));
      consent = await api(
        "aa",
        "/aa/consents/" + encodeURIComponent(aa.consentId),
      );
    } catch (e) {
      aaError = e.message;
    }
    return {
      req,
      aa,
      consent,
      aaError,
      accounts:
        role === "aa" ? await api("aa", "/aa/accounts/" + user.userId) : [],
    };
  }, [id, role, user.userId]);
  const [action, setAction] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [result, setResult] = useState(null);
  return (
    <>
      <PageTitle
        title="Request details"
        text={id}
        action={
          <button className="secondary" onClick={resource.refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="alert success" role="status">
          {notice}
        </div>
      )}
      <Resource resource={resource}>
        {({ req, aa, consent, accounts, aaError }) => (
          <>
            <div className="two-col">
              <Section
                title={req.purpose}
                action={<Badge value={requestStatus(req, aa, consent)} />}
              >
                <dl className="details">
                  <div>
                    <dt>Request ID</dt>
                    <dd>{id}</dd>
                  </div>
                  <div>
                    <dt>Consent ID</dt>
                    <dd>{consent?.consentId || "Not yet available"}</dd>
                  </div>
                  <div>
                    <dt>Data period</dt>
                    <dd>
                      {date(req.fromDate)} — {date(req.toDate)}
                    </dd>
                  </div>
                  <div>
                    <dt>Consent expires</dt>
                    <dd>{date(consent?.expiresAt)}</dd>
                  </div>
                  <div>
                    <dt>Requesting FIU</dt>
                    <dd>{aa?.fiuId || user.institutionId || "—"}</dd>
                  </div>
                  <div>
                    <dt>Consent status</dt>
                    <dd>
                      {consent ? (
                        <Badge value={consent.status} />
                      ) : (
                        "Not yet available"
                      )}
                    </dd>
                  </div>
                </dl>
                <div className="scope-chips">
                  {(
                    consent?.dataScopes ||
                    (req.dataScopes || req.dataScope || "").split(",")
                  ).map((s) => (
                    <span key={s}>
                      <Check size={14} />
                      {scopeNames[s] || s}
                    </span>
                  ))}
                </div>
                {aaError && (
                  <div className="alert error">
                    AA details unavailable: {aaError}
                  </div>
                )}
                {role === "aa" && consent && (
                  <div className="button-row">
                    {consent.status === "PENDING" ? (
                      <>
                        <button
                          className="primary"
                          onClick={() => setAction("approve")}
                        >
                          <ShieldCheck size={17} />
                          Approve consent
                        </button>
                        <button
                          className="secondary danger"
                          onClick={() => setAction("reject")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      consent.status === "ACTIVE" && (
                        <button
                          className="secondary danger"
                          onClick={() => setAction("revoke")}
                        >
                          Revoke consent
                        </button>
                      )
                    )}
                  </div>
                )}
                {role === "fip" && consent && (
                  <button
                    className="primary"
                    onClick={async () => {
                      setError("");
                      try {
                        const r = await api("bank", "/bank/validate-consent", {
                          method: "POST",
                          body: { consentId: consent.consentId },
                        });
                        setNotice(r.message);
                      } catch (e) {
                        setError(e.message);
                      }
                    }}
                  >
                    <ShieldCheck size={17} />
                    Validate consent
                  </button>
                )}
              </Section>
              <aside className="explain">
                <h3>Request journey</h3>
                <div className="journey">
                  {[
                    ["Request created", true],
                    [
                      "Consent approved",
                      consent?.status === "ACTIVE" ||
                        aa?.status === "DATA_RECEIVED",
                    ],
                    [
                      "Data delivered to FIU",
                      req.status === "DATA_RECEIVED" ||
                        aa?.status === "DATA_RECEIVED",
                    ],
                  ].map(([label, done]) => (
                    <div key={label} className={done ? "done" : ""}>
                      <CheckCircle2 size={22} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <p>Refresh to see updates made in another portal.</p>
              </aside>
            </div>
            {consent?.consentId && <BlockchainAudit consentId={consent.consentId} />}
            {role === "aa" && aa?.status === "CONSENT_APPROVED" && (
              <Section
                title="Share approved information"
                sub="Choose a linked account. AA retrieves the authorized data and sends it to FIU."
              >
                {accounts.length ? (
                  <Form
                    button="Retrieve and deliver to FIU"
                    onSubmit={async (v) => {
                      const r = await api(
                        "aa",
                        `/aa/data-requests/${encodeURIComponent(id)}/execute`,
                        { method: "POST", query: v },
                      );
                      setResult(parseData(r));
                      setNotice("Data retrieved and delivered to FIU.");
                      await resource.refresh();
                    }}
                  >
                    <label className="field">
                      <span>Linked account</span>
                      <select name="accountNumber">
                        {accounts.map((a) => (
                          <option key={a.id} value={a.accountNumber}>
                            {a.bankName} · {a.accountNumber}
                          </option>
                        ))}
                      </select>
                    </label>
                  </Form>
                ) : (
                  <Empty
                    title="Link an account first"
                    text="A linked bank account is needed to execute this request."
                    action={
                      <Link className="primary" to="/aa/accounts">
                        Link bank account
                      </Link>
                    }
                  />
                )}
              </Section>
            )}
            {role === "fip" && consent?.status === "ACTIVE" && (
              <Section
                title="Provide authorized data"
                sub="FIP responds to AA retrieval calls automatically. Inspect the authorized response below."
              >
                <DataFetch
                  consent={consent}
                  service="bank"
                  prefix="/fip/data"
                />
              </Section>
            )}
            {(result || req.responseData) && (
              <Section title="Received financial information">
                <FinancialData data={parseData(result || req.responseData)} />
              </Section>
            )}
            {action && (
              <Confirm
                action={action}
                busy={busy}
                onClose={() => setAction("")}
                onConfirm={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await api(
                      "aa",
                      `/aa/consents/${encodeURIComponent(consent.consentId)}/${action}`,
                      { method: "PUT" },
                    );
                    setNotice(
                      `Consent ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "revoked"}.`,
                    );
                    setAction("");
                    await resource.refresh();
                  } catch (e) {
                    setError(e.message);
                    setAction("");
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            )}
          </>
        )}
      </Resource>
    </>
  );
}
function FinancialData({ data }) {
  const d = parseData(data);
  if (!d || typeof d !== "object") return <p>{String(d || "No data")}</p>;
  return (
    <div className="financial">
      {Object.entries(d).map(([key, value]) => {
        if (value == null) return null;
        if (Array.isArray(value))
          return (
            <div key={key}>
              <h4>{nice(key)}</h4>
              {value.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(value[0])
                          .filter((k) => !["id", "accountId"].includes(k))
                          .map((k) => (
                            <th key={k}>
                              {nice(k.replace(/([A-Z])/g, " $1"))}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {value.map((row, i) => (
                        <tr key={i}>
                          {Object.entries(row)
                            .filter(([k]) => !["id", "accountId"].includes(k))
                            .map(([k, v]) => (
                              <td key={k}>
                                {k === "amount" ? money(v) : String(v)}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No records in this period.</p>
              )}
            </div>
          );
        if (typeof value === "object")
          return (
            <div className="data-group" key={key}>
              <h3>{nice(key)}</h3>
              <FinancialData data={value} />
            </div>
          );
        return (
          <div className="data-pair" key={key}>
            <span>{nice(key.replace(/([A-Z])/g, " $1"))}</span>
            <strong>{key === "balance" ? money(value) : String(value)}</strong>
          </div>
        );
      })}
    </div>
  );
}
function DataFetch({
  consent,
  service = "aa",
  prefix = "/aa/data",
  accounts = [],
}) {
  const [result, setResult] = useState(null);
  return (
    <>
      <Form
        button="Retrieve information"
        onSubmit={async (v) =>
          setResult(
            parseData(
              await api(service, prefix + "/" + v.kind, {
                method: "POST",
                query: {
                  accountNumber: v.accountNumber,
                  consentId: consent.consentId,
                  ...(v.kind === "transactions"
                    ? { fromDate: consent.fromDate, toDate: consent.toDate }
                    : {}),
                },
              }),
            ),
          )
        }
      >
        <div className="form-grid">
          {accounts.length ? (
            <label className="field">
              <span>Account</span>
              <select name="accountNumber">
                {accounts.map((a) => (
                  <option key={a.id} value={a.accountNumber}>
                    {a.bankName} · {a.accountNumber}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <Field
              label="Account number"
              name="accountNumber"
              placeholder="AC1000234567"
            />
          )}
          <label className="field">
            <span>Information</span>
            <select name="kind">
              {consent.dataScopes.map((s) => (
                <option
                  key={s}
                  value={
                    s === "ACCOUNT"
                      ? "account"
                      : s === "TRANSACTIONS"
                        ? "transactions"
                        : "loans"
                  }
                >
                  {scopeNames[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Form>
      {result && <FinancialData data={result} />}
    </>
  );
}
function Accounts({ user }) {
  const resource = useResource(
      () => api("aa", "/aa/accounts/" + user.userId),
      [user.userId],
    ),
    [open, setOpen] = useState(false),
    [verifiedAccounts, setVerifiedAccounts] = useState([]);
  return (
    <>
      <PageTitle
        title="Linked bank accounts"
        text="Connect your financial world. Decide what to share, one request at a time."
        action={
          <button className="primary" onClick={() => setOpen(!open)}>
            <Plus size={17} />
            Link bank
          </button>
        }
      />
      {open && (
        <Section
          title="Link your bank account"
          sub="Verify with your bank’s demo netbanking credentials."
        >
          <Form
            button="Verify and link"
            onSubmit={async (v) => {
              const result = await api("aa", "/aa/accounts/link", {
                method: "POST",
                body: { ...v, userId: user.userId },
              });
              if (result.linked) {
                setOpen(false);
                setVerifiedAccounts([]);
                await resource.refresh();
              } else {
                setVerifiedAccounts(result.accounts || []);
              }
            }}
          >
            <div className="form-grid">
              <Field
                label="Netbanking username"
                name="username"
                autoComplete="off"
              />
              <Field
                label="Netbanking password"
                name="password"
                type="password"
                autoComplete="off"
              />
              {verifiedAccounts.length > 0 && (
                <label className="field">
                  <span>Choose verified account</span>
                  <select name="bankAccountId" required defaultValue="">
                    <option value="" disabled>Select an account</option>
                    {verifiedAccounts.map((account) => (
                      <option key={account.bankAccountId} value={account.bankAccountId}>
                        {account.bankName} · •••• {account.accountNumberLastFour}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {verifiedAccounts.length === 0 && <p className="hint">Verify your credentials to view eligible accounts, then choose which one to link.</p>}
          </Form>
        </Section>
      )}
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="account-grid">
              {rows.map((a) => (
                <div className="account-card" key={a.id}>
                  <div>
                    <span className="stat-icon">
                      <Landmark />
                    </span>
                    <Badge value={a.status} />
                  </div>
                  <h2>{a.bankName}</h2>
                  <p className="account-number">
                    •••• {a.accountNumber.slice(-4)}
                  </p>
                  <dl>
                    <dt>Account number</dt>
                    <dd>•••• {a.accountNumber.slice(-4)}</dd>
                    <dt>IFSC</dt>
                    <dd>{a.ifsc}</dd>
                    <dt>Linked on</dt>
                    <dd>{date(a.linkedAt)}</dd>
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <Section title="Your accounts">
              <Empty
                title="Bring your accounts together"
                text="Link your first account to share information with your consent."
                action={
                  <button className="primary" onClick={() => setOpen(true)}>
                    Link bank account <Plus size={16} />
                  </button>
                }
              />
            </Section>
          )
        }
      </Resource>
    </>
  );
}
function Consents({ user }) {
  const resource = useResource(
    () => api("aa", "/aa/consents/user/" + user.userId),
    [user.userId],
  );
  return (
    <>
      <PageTitle
        title="Consent management"
        text="Understand every permission. Approve, reject, or revoke with confidence."
        action={
          <button className="secondary" onClick={resource.refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />
      <Section title="Your permissions">
        <Resource resource={resource}>
          {(rows) => <RequestTable role="aa" rows={[...rows].reverse()} />}
        </Resource>
      </Section>
    </>
  );
}
function DataView({ user }) {
  const r = useResource(
      async () => ({
        cs: await api("aa", "/aa/consents/user/" + user.userId),
        accounts: await api("aa", "/aa/accounts/" + user.userId),
      }),
      [user.userId],
    ),
    [selected, setSelected] = useState("");
  return (
    <>
      <PageTitle
        title="Financial information"
        text="View account details, transactions, and loans using an active consent."
      />
      <Resource resource={r}>
        {({ cs, accounts }) => {
          const active = cs.filter(
            (c) => c.status === "ACTIVE" && new Date(c.expiresAt) > new Date(),
          );
          const c = active.find((c) => c.consentId === selected) || active[0];
          return (
            <Section title="Retrieve consented information">
              {c ? (
                <>
                  <label className="field">
                    <span>Active consent</span>
                    <select
                      value={c.consentId}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      {active.map((x) => (
                        <option key={x.consentId} value={x.consentId}>
                          {x.purpose} · {x.consentId}
                        </option>
                      ))}
                    </select>
                  </label>
                  <DataFetch
                    key={c.consentId}
                    consent={c}
                    accounts={accounts}
                  />
                </>
              ) : (
                <Empty
                  title="An active consent is needed"
                  text="Approve a request before retrieving financial information."
                  action={
                    <Link className="primary" to="/aa/consents">
                      Review consents
                    </Link>
                  }
                />
              )}
            </Section>
          );
        }}
      </Resource>
    </>
  );
}
function Audit({ user }) {
  const r = useResource(async () => {
    if (user.role !== "ADMIN") return null;
    return api("aa", "/aa/admin/audit-logs");
  }, [user.role]);
  return (
    <>
      <PageTitle
        title="Audit activity"
        text="A record of account and consent events."
      />
      <Section title="Activity log">
        <Resource resource={r}>
          {(data) =>
            data ? (
              <FinancialData data={{ events: data }} />
            ) : (
              <Empty
                title="Administrator access required"
                text="The current backend exposes an administrator audit endpoint only. Your consent history is available in Consent management."
              />
            )
          }
        </Resource>
      </Section>
    </>
  );
}
function FipTools() {
  const [result, setResult] = useState(null);
  return (
    <>
      <PageTitle
        title="Consent validation"
        text="Check that a consent is registered, active, and within its validity period."
      />
      <Section title="Validate at the bank">
        <Form
          button="Validate consent"
          onSubmit={async (v) =>
            setResult(
              await api("bank", "/bank/validate-consent", {
                method: "POST",
                body: v,
              }),
            )
          }
        >
          <Field label="Consent ID" name="consentId" placeholder="CONSENT-…" />
        </Form>
        {result && <div className="alert success">{result.message}</div>}
      </Section>
    </>
  );
}
function Shell({ user, onLogout }) {
  const role = user.portal,
    [menu, setMenu] = useState(false);
  const items = [
    ["dashboard", "Overview", LayoutDashboard],
    ["requests", "Data requests", FileText],
    ...(role !== "fip" ? [["create", "Create request", Plus]] : []),
    ...(role === "aa"
      ? [
          ["consents", "Consents", ShieldCheck],
          ["accounts", "Linked accounts", Landmark],
          ["data", "Financial information", Database],
          ["audit", "Audit activity", Activity],
        ]
      : role === "fiu"
        ? [["received", "Received data", Database]]
        : [["validate", "Validate consent", ShieldCheck]]),
    ["history", "Request history", History],
  ];
  return (
    <div className={"app theme-" + role}>
      <aside className={"sidebar " + (menu ? "mobile-open" : "")}>
        <Brand />
        <div className="workspace-label">
          <span>{roles[role].short}</span>
          <div>
            {roles[role].label}
            <small>Local workspace</small>
          </div>
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {items.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={`/${role}/${path}`}
              onClick={() => setMenu(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={21} />
            <strong>Permission, with purpose.</strong>
            <p>Clear consent for every data journey.</p>
          </div>
          <button onClick={onLogout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <header>
          <button
            className="menu-button"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <span className="breadcrumb">
            Workspace <ChevronRight size={14} /> {roles[role].short} portal
          </span>
          <div className="header-right">
            <span className="local-badge">LOCAL DEMO</span>
            <span className="avatar">
              {user.username.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{user.name || user.username}</strong>
              <small>
                {role === "aa"
                  ? "Customer ID: " + user.userId
                  : user.institutionId}
              </small>
            </div>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="dashboard" element={<Dashboard user={user} />} />
            <Route path="requests" element={<Requests user={user} />} />
            <Route
              path="requests/:id"
              element={<RequestDetail user={user} />}
            />
            <Route path="history" element={<Requests user={user} history />} />
            {role !== "fip" && (
              <Route path="create" element={<CreateRequest user={user} />} />
            )}
            {role === "aa" && (
              <>
                <Route path="consents" element={<Consents user={user} />} />
                <Route path="accounts" element={<Accounts user={user} />} />
                <Route path="data" element={<DataView user={user} />} />
                <Route path="audit" element={<Audit user={user} />} />
              </>
            )}
            {role === "fiu" && (
              <Route
                path="received"
                element={<Requests user={user} received />}
              />
            )}
            {role === "fip" && <Route path="validate" element={<FipTools />} />}
            <Route
              path="*"
              element={<Navigate to={`/${role}/dashboard`} replace />}
            />
          </Routes>
        </main>
        <footer>
          ConsentChain{" "}
          <span>Financial information, shared with permission.</span>
        </footer>
      </div>
    </div>
  );
}
function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cc-session"));
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  function login(u) {
    sessionStorage.setItem("cc-session", JSON.stringify(u));
    setUser(u);
    navigate("/" + u.portal + "/dashboard");
  }
  function logout() {
    sessionStorage.removeItem("cc-session");
    setUser(null);
    navigate("/" + user.portal + "/login");
  }
  return (
    <Routes>
      <Route path="/:role/login" element={<Auth onLogin={login} />} />
      {["aa", "fiu", "fip"].map((role) => (
        <Route
          key={role}
          path={"/" + role + "/*"}
          element={
            user?.portal === role ? (
              <Shell user={user} onLogout={logout} />
            ) : (
              <Navigate to={"/" + role + "/login"} replace />
            )
          }
        />
      ))}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? "/" + user.portal + "/dashboard" : "/aa/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
