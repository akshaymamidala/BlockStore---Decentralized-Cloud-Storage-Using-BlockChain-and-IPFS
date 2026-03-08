"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { FileRegistry } from "../abis/FileRegistry";
import { encryptFile } from "@/lib/fileCrypto";

type StatusTone = "info" | "success" | "error" | "warn";

export default function UploadPage() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const chainId = useChainId();

  const [file, setFile] = useState<File | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<StatusTone>("info");
  const [isUploading, setIsUploading] = useState(false);

  const isSepolia = chainId === sepolia.id;

  const fileSizeLabel = useMemo(() => {
    if (!file) return "No file selected";
    const kb = file.size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }, [file]);

  const setFeedback = (message: string, tone: StatusTone) => {
    setStatus(message);
    setStatusTone(tone);
  };

  const uploadFile = async () => {
    if (!file) {
      setFeedback("Please choose a file.", "warn");
      return;
    }

    if (!address) {
      setFeedback("Please connect your wallet first.", "warn");
      return;
    }

    if (!isSepolia) {
      setFeedback("Please switch MetaMask network to Sepolia.", "warn");
      return;
    }

    if (passphrase.length < 8) {
      setFeedback("Passphrase must be at least 8 characters.", "warn");
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setFeedback("Passphrases do not match.", "warn");
      return;
    }

    try {
      setIsUploading(true);
      setFeedback("Encrypting file in browser...", "info");

      const encryptedPayload = await encryptFile(file, passphrase);
      const encryptedBlob = new Blob([JSON.stringify(encryptedPayload)], {
        type: "application/json",
      });

      setFeedback("Uploading encrypted payload to IPFS...", "info");

      const data = new FormData();
      data.append("file", encryptedBlob, `${file.name}.enc.json`);

      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
        },
        body: data,
      });

      if (!res.ok) {
        throw new Error(`Pinata upload failed (${res.status})`);
      }

      const result = await res.json();
      const cid = result.IpfsHash as string | undefined;

      if (!cid) {
        throw new Error("Pinata response missing IpfsHash");
      }

      setFeedback("Confirm transaction in MetaMask to store CID...", "info");

      await writeContractAsync({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
        abi: FileRegistry,
        functionName: "storeFile",
        args: [cid],
        chainId: sepolia.id,
      });

      setFeedback(`Encrypted file uploaded successfully. CID: ${cid}`, "success");
    } catch (error) {
      console.error(error);
      setFeedback("Upload failed. Please retry and confirm wallet transaction.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="section-space">
      <section className="panel">
        <h1 className="page-title">Encrypted Upload</h1>
        <p className="page-subtitle">
          Files are encrypted before upload. Only the passphrase can decrypt them later.
        </p>

        <div className="field-stack section-space">
          {!isSepolia && (
            <div className="status-banner status-warn">
              Switch wallet network to Sepolia before uploading.
            </div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="upload-file">Select file</label>
            <input
              id="upload-file"
              type="file"
              className="input file-input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="meta-text">{file ? `${file.name} | ${fileSizeLabel}` : fileSizeLabel}</p>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="passphrase">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Minimum 8 characters"
              className="input"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="confirm-passphrase">Confirm passphrase</label>
            <input
              id="confirm-passphrase"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Re-enter passphrase"
              className="input"
            />
          </div>

          <div className="btn-row">
            <button
              onClick={uploadFile}
              disabled={isUploading}
              className="btn btn-primary"
            >
              {isUploading ? "Processing..." : "Encrypt and Upload"}
            </button>
          </div>

          {status && (
            <div className={`status-banner status-${statusTone}`}>
              {status}
            </div>
          )}

          <p className="meta-text">
            Keep this passphrase private. There is no recovery path if lost.
          </p>
        </div>
      </section>
    </div>
  );
}
