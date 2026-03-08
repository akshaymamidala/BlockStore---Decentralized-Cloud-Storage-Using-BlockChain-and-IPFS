import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-layout">
      <section className="panel" style={{ width: "min(620px, 100%)", textAlign: "center" }}>
        <p className="chip chip-warn" style={{ display: "inline-flex", marginBottom: 12 }}>404</p>
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle" style={{ margin: "0 auto" }}>
          This route does not exist in BlockStore. Use the navigation to return to a valid workflow.
        </p>
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 16 }}>
          <Link href="/" className="btn btn-primary">Go Home</Link>
          <Link href="/upload" className="btn btn-secondary">Upload File</Link>
        </div>
      </section>
    </div>
  );
}
