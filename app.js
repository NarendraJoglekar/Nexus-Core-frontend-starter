import { v4 as uuid } from "https://cdn.jsdelivr.net/npm/uuid@9.0.1/+esm";

const { useState, createElement: h } = React;

/* ---- Mock AI check services (pure front end) ---- */
const AI = {
  async news(c) {
    return `NewsAI: ${c.name} found in 3 market articles.`;
  },
  async risk(c) {
    return c.arr < 50000
      ? "RiskAI: Low revenue, high risk detected!"
      : "RiskAI: Financial status looks stable.";
  },
  async esg(c) {
    return c.claims.toLowerCase().includes("eco")
      ? "ESGAI: Sustainability claims seem credible."
      : "ESGAI: No validated ESG sustainability signals.";
  },
  async partners(c) {
    return "PartnerAI: 2 verified business partners confirmed.";
  }
};

/* ---- NexusCore aggregator ---- */
async function runNexusCore(c) {
  const r = await Promise.all([
    AI.news(c),
    AI.risk(c),
    AI.esg(c),
    AI.partners(c)
  ]);

  return {
    submissionId: c.id,
    summary: r,
    investorEvidence: [
      "Internal score: 82/100",
      "Legal confidence: 91%",
      "Growth signal strength: Medium"
    ],
    createdAt: new Date().toISOString()
  };
}

/* ---- Components ---- */
function Header({ role, loginAs, logout }) {
  return h("header", { className: "navbar" },
    h("div", { className: "logo" },
      h("h1", {}, "NexusCore"),
      h("p", {}, "AI Investing Intelligence")
    ),
    !role ? h("div", { className: "flex gap-3" },
        h("button", { className: "btn-outline", onClick: () => loginAs("corporate") }, "Corporate"),
        h("button", { className: "btn-primary", onClick: () => loginAs("investor") }, "Investor")
      )
      : h("div", { className: "flex items-center gap-3 text-sm" },
        h("span", { className: "px-2 py-1 bg-slate-100 rounded" }, role.toUpperCase()),
        h("button", { className: "text-red-600", onClick: logout }, "Logout")
      )
  );
}

function SubmitCompany({ onGenerate }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    id: "sub_" + uuid(),
    name: "",
    sector: "",
    arr: 0,
    runway: 0,
    team: "",
    claims: ""
  });

  const update = e => setData({ ...data, [e.target.name]: e.target.value });

  return h("div", { className: "card" },
    h("h2", { className: "text-xl font-bold mb-4" }, `Company Submission (Step ${step}/3)`),

    step === 1 && (
      h("div", {},
        h("label", {}, "Company Name"),
        h("input", { name: "name", onChange: update, placeholder: "Example: AI Farm Ltd." }),

        h("label", {}, "Sector"),
        h("select", { name: "sector", onChange: update },
          h("option", {}, "AI Startup"),
          h("option", {}, "FinTech"),
          h("option", {}, "Energy")
        ),
        h("button", { className: "btn-primary", onClick: () => setStep(2) }, "Next")
      )
    ),

    step === 2 && (
      h("div", {},
        h("label", {}, "ARR (USD)"),
        h("input", { type: "number", name: "arr", onChange: update, placeholder: "50000" }),

        h("label", {}, "Runway (Months)"),
        h("input", { type: "number", name: "runway", onChange: update, placeholder: "12" }),

        h("button", { className: "btn-outline mr-2", onClick: () => setStep(1) }, "Back"),
        h("button", { className: "btn-primary", onClick: () => setStep(3) }, "Next")
      )
    ),

    step === 3 && (
      h("div", {},
        h("label", {}, "Team Description"),
        h("textarea", { name: "team", onChange: update, placeholder: "5 engineers, 2 founders..." }),

        h("label", {}, "Claims"),
        h("textarea", { name: "claims", onChange: update, placeholder: "We are eco-friendly, growing fast..." }),

        h("button", { className: "btn-outline mr-2", onClick: () => setStep(2) }, "Back"),
        h("button", { className: "btn-success", onClick: () => onGenerate(data) }, "Submit & Run AI")
      )
    )
  );
}

function ReportViewer({ report }) {
  if (!report) return null;
  return h("div", { className: "card" },
    h("h2", { className: "text-lg font-bold" }, "Investor Analysis Report"),
    h("pre", {}, report.summary.join("\n")),
    h("p", { className: "text-xs text-slate-500 mt-3" }, `Created at: ${report.createdAt}`)
  );
}

/* ---- App Container ---- */
function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("home");
  const [report, setReport] = useState("");

  const generate = async (c) => {
    const r = await runNexusCore(c);
    setReport(r);
  };

  return h("div", {},
    h(Header, { role, loginAs: setRole, logout: () => setRole(null) }),

    !role && !report && h("section", { className: "card text-center" },
      h("h3", { className: "text-2xl font-extrabold" }, "Submit your company to find investors"),
      h("button", { className: "btn-primary mt-4", onClick: () => setPage("submit") }, "Start Submission")
    ),

    role === "corporate" && h(SubmitCompany, { onGenerate: generate }),

    role === "investor" && h(ReportViewer, { report }),

    role !== "investor" && report && h("section", { className: "card text-center text-red-600" },
      "❌ Only investors can view full AI risk evidence."
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
