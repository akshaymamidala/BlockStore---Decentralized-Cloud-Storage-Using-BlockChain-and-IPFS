"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { FileRegistry } from "../abis/FileRegistry";
import {
  decryptFilePayload,
  isEncryptedFilePayload,
} from "@/lib/fileCrypto";

type StatusTone = "info" | "success" | "error" | "warn";

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DownloadPage() {
  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;

  const { address } = useAccount();
  const chainId = useChainId();

  const [passphrase, setPassphrase] = useState("");
  const [activeCid, setActiveCid] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");

  const isSepolia = chainId === sepolia.id;

  const { data, isLoading, isError, error } = useReadContract({
    address: contractAddress ?? "0x0000000000000000000000000000000000000000",
    abi: FileRegistry,
    functionName: "getUserFiles",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: sepolia.id,
    query: {
      enabled: !!address && !!contractAddress && isSepolia,
    },
  });

  const files = Array.isArray(data) ? data : [];

  const fileCountLabel =
    files.length === 0 ? "No files" : files.length === 1 ? "1 file" : `${files.length} files`;

  const setFeedback = (message: string, tone: StatusTone) => {
    setStatus(message);
    setStatusTone(tone);
  };

  const decryptAndDownload = async (cid: string) => {
    if (!passphrase) {
      setFeedback("Enter the passphrase to decrypt files.", "warn");
      return;
    }

    try {
      setActiveCid(cid);
      setFeedback("Fetching encrypted payload from IPFS...", "info");

      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch file (${response.status})`);
      }

      const blob = await response.blob();
      const rawText = await blob.text();

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }

      if (isEncryptedFilePayload(parsed)) {
        setFeedback("Decrypting in browser...", "info");
        const decryptedBlob = await decryptFilePayload(parsed, passphrase);
        triggerDownload(decryptedBlob, parsed.name);
        setFeedback(`Decrypted and downloaded: ${parsed.name}`, "success");
        return;
      }

      triggerDownload(blob, `${cid}`);
      setFeedback("Legacy raw file downloaded (not encrypted payload format).", "warn");
    } catch (downloadError) {
      console.error(downloadError);
      setFeedback("Failed to decrypt/download file. Check CID or passphrase.", "error");
    } finally {
      setActiveCid(null);
    }
  };

  if (!address) {
    return (
      <section className="panel section-space">
        <h1 className="page-title">Your File Vault</h1>
        <p className="status-banner status-warn">Please connect your wallet.</p>
      </section>
    );
  }

  if (!isSepolia) {
    return (
      <section className="panel section-space">
        <h1 className="page-title">Your File Vault</h1>
        <p className="status-banner status-warn">Please switch MetaMask network to Sepolia.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="panel section-space">
        <h1 className="page-title">Your File Vault</h1>
        <p className="status-banner status-info">Loading files from chain...</p>
      </section>
    );
  }

  if (!contractAddress) {
    return (
      <section className="panel section-space">
        <h1 className="page-title">Your File Vault</h1>
        <p className="status-banner status-error">
          Contract address is missing. Set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment.
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="panel section-space">
        <h1 className="page-title">Your File Vault</h1>
        <p className="status-banner status-error">
          Failed to fetch files: {error?.message ?? "Unknown error"}
        </p>
      </section>
    );
  }

  return (
    <div className="section-space">
      <section className="panel">
        <div className="file-card-header" style={{ marginBottom: 10 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>Your File Vault</h1>
            <p className="page-subtitle">Decrypt files locally using your passphrase.</p>
          </div>
          <span className="chip">{fileCountLabel}</span>
        </div>

        <div className="field-group" style={{ marginBottom: 14 }}>
          <label className="field-label" htmlFor="decrypt-passphrase">Passphrase</label>
          <input
            id="decrypt-passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter decryption passphrase"
            className="input"
          />
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            No CIDs found for this wallet address yet. Upload a file first.
          </div>
        ) : (
          <div className="file-list">
            {files.map((cid, index) => (
              <article key={cid} className="file-card">
                <div className="file-card-header">
                  <h2 className="card-title">Encrypted File #{index + 1}</h2>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-inline"
                  >
                    Open Raw CID
                  </a>
                </div>

                <p className="cid-line">{cid}</p>

                <div className="btn-row" style={{ marginTop: 12 }}>
                  <button
                    onClick={() => decryptAndDownload(cid)}
                    disabled={activeCid === cid}
                    className="btn btn-primary"
                  >
                    {activeCid === cid ? "Processing..." : "Decrypt and Download"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {status && <p className={`status-banner status-${statusTone}`}>{status}</p>}
      </section>
    </div>
  );
}
