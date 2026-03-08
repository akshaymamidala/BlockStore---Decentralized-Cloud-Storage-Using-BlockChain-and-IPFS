import Link from "next/link";

const cards = [
  {
    title: "Upload New File",
    description: "Encrypt in your browser and pin to IPFS with wallet-backed ownership.",
    href: "/upload",
    cta: "Go to Upload",
  },
  {
    title: "Access Vault",
    description: "Fetch your on-chain CIDs and decrypt files locally with your passphrase.",
    href: "/download",
    cta: "Open Vault",
  },
  {
    title: "Security Model",
    description: "Review encryption flow, key ownership assumptions, and trust boundaries.",
    href: "/security",
    cta: "View Security",
  },
];

export default function DashboardPage() {
  return (
    <div className="section-space">
      <section className="panel">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Manage your decentralized storage workflow from one place.
        </p>
      </section>

      <section className="panel section-space">
        <h2 className="card-title" style={{ marginBottom: 12 }}>
          Quick Actions
        </h2>

        <div className="card-grid">
          {cards.map((card) => (
            <article key={card.title} className="feature-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <Link href={card.href} className="btn btn-primary">
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

