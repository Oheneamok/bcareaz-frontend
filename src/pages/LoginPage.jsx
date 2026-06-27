import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@homeofloveaz.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

		localStorage.setItem("bcareaz_token", res.data.access_token);
		localStorage.setItem("bcareaz_user", JSON.stringify(res.data.user || {}));

		try {
		  const permissionsRes = await api.get("/portal/me/permissions");
		  localStorage.setItem(
			"unifiedcare_permissions",
			JSON.stringify(permissionsRes.data)
		  );
		} catch (permissionError) {
		  console.warn("Portal permissions could not be loaded.", permissionError);
		}

		window.location.href = "/portal";
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="premium-login-page">
      <div className="login-bg-orb orb-one" />
      <div className="login-bg-orb orb-two" />

      <section className="login-info-panel">
        <div className="login-logo-row">
          <div className="premium-brand-mark">b</div>
          <div>
            <h1>bCareAZ</h1>
            <p>Behavioral Health Residential Facility CRM</p>
          </div>
        </div>

        <div className="login-message">
          <p className="dashboard-eyebrow">HIPAA-conscious operations</p>
          <h2>Clinical, compliance, documentation, and workflow command center.</h2>
          <p>
            Built for Home of Love to manage residents, staff compliance,
            treatment documentation, e-signatures, medications, tasks, and alerts.
          </p>
        </div>

        <div className="login-trust-card">
          <ShieldCheck size={22} />
          <div>
            <strong>Dedicated Facility Tenant</strong>
            <span>Separate environment, controlled access, audit-ready records.</span>
          </div>
        </div>
      </section>

      <form className="premium-login-card" onSubmit={handleLogin}>
        <div className="login-card-icon">
          <LockKeyhole size={24} />
        </div>

        <h2>Welcome back</h2>
        <p className="login-subtitle">Sign in to continue to bCareAZ.</p>

        {error && <div className="error-box">{error}</div>}

        <label>Email Address</label>
        <input
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@homeofloveaz.com"
        />

        <label>Password</label>
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="login-submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="login-footnote">
          Authorized staff only. All activity may be audited.
        </p>
      </form>
    </div>
  );
}