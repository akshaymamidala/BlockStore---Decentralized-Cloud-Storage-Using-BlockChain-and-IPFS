import Link from "next/link";

const principles = [
  {
    title: "Client-side first",
    desc: "Encryption happens in the browser before any data leaves your device.",
  },
  {
    title: "Strong primitive",
    desc: "AES-256-GCM is used for authenticated encryption to ensure confidentiality and integrity.",
  },
  {
    title: "Derived keys",
    desc: "Your passphrase is hardened with PBKDF2 and random salt before key generation.",
  },
  {
    title: "On-chain indexing",
    desc: "Only file CIDs are stored in FileRegistry; plaintext file data is never on-chain.",
  },
  {
    title: "Portable data",
    desc: "Encrypted payloads are JSON so retrieval/decryption can be implemented in any compatible client.",
  },
  {
    title: "User custody",
    desc: "Passphrase stays with you. No centralized recovery service is involved.",
  },
];

export default function SecurityPage() {
  return (
    <div className="section-space">
      <section className="panel">
        <h1 className="page-title">Security Architecture</h1>
        <p className="page-subtitle">
          BlockStore is designed so storage stays distributed while decryption control remains fully with the user.
        </p>

        <div className="chip-row section-space">
          <span className="chip chip-good">AES-GCM</span>
          <span className="chip">PBKDF2</span>
          <span className="chip">Wallet-scoped CIDs</span>
          <span className="chip">Client-only decryption</span>
        </div>
      </section>

      <section className="panel section-space">
        <h2 className="card-title" style={{ marginBottom: 12 }}>Core principles</h2>
        <div className="card-grid">
          {principles.map((item) => (
            <article key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel section-space">
        <h2 className="card-title" style={{ marginBottom: 10 }}>Operational guidance</h2>
        <div className="field-stack">
          <p className="meta-text">
            Use long passphrases and avoid reuse across services. Store passphrases in a trusted password manager.
          </p>
          <p className="meta-text">
            Rotate to a new passphrase for highly sensitive uploads and maintain local backups of important files.
          </p>
          <div className="btn-row">
            <Link href="/upload" className="btn btn-primary">Go to Upload</Link>
            <Link href="/download" className="btn btn-secondary">Go to Download</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
