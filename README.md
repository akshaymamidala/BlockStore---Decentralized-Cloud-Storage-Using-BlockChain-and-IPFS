# BlockStore

BlockStore is a decentralized file storage demo built with:

- `Hardhat` + Solidity smart contract (`FileRegistry`)
- `Next.js` frontend (`ipfs-nextjs-app`)
- `IPFS (Pinata)` for encrypted file storage
- `MetaMask + Sepolia` for wallet-based ownership and on-chain CID indexing

Files are encrypted in the browser before upload. Only encrypted payloads are pinned to IPFS, while CIDs are stored on-chain per wallet address.

## Project Structure

```text
C:\D2
|- contracts/
|  `- FileRegistry.sol
|- scripts/
|  `- deploy.js
|- test/
|  `- Lock.js   (tests FileRegistry behavior)
|- hardhat.config.cjs
`- ipfs-nextjs-app/
   |- src/app/upload/page.tsx
   |- src/app/download/page.tsx
   |- src/lib/fileCrypto.ts
   `- .env.local
```

## Features

- Client-side encryption using `AES-256-GCM`
- Key derivation using `PBKDF2` (250,000 iterations)
- CID ownership mapped by wallet address in `FileRegistry`
- Wallet connect, network switch, and contract calls via `wagmi` + `ethers`
- File decrypt/download flow directly in browser

## Prerequisites

- Node.js `20+`
- npm
- MetaMask browser extension
- Sepolia test ETH
- Pinata account/API credentials

## 1) Smart Contract Setup (Hardhat)

From repo root (`C:\D2`):

```bash
npm install
```

Create a root `.env` file:

```env
SEPOLIA_PRIVATE_KEY=your_wallet_private_key_without_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

Compile:

```bash
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed contract address from terminal output.

## 2) Frontend Setup (Next.js)

Move to frontend app:

```bash
cd ipfs-nextjs-app
npm install
```

Create `ipfs-nextjs-app/.env.local`:

```env
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Flow

1. Connect MetaMask wallet.
2. Switch to Sepolia.
3. Go to `/upload`, choose file, add passphrase, upload.
4. App encrypts file in browser and pins encrypted JSON payload to IPFS.
5. CID is stored on-chain via `storeFile(cid)`.
6. Go to `/download` to fetch your CIDs from `getUserFiles(address)`.
7. Enter same passphrase to decrypt and download file locally.

## Smart Contract

`contracts/FileRegistry.sol`:

- `storeFile(string cid)`: stores CID under `msg.sender`
- `getUserFiles(address user)`: returns all CIDs for that user

## Security Notes

- Never commit real private keys or production API secrets.
- `NEXT_PUBLIC_*` variables are exposed to browser clients. Do not use this setup as-is for production secrets.
- If passphrase is lost, encrypted file cannot be recovered.
- Contract currently stores CIDs only (no advanced access control or sharing permissions).

## Useful Commands

From `C:\D2`:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

From `C:\D2\ipfs-nextjs-app`:

```bash
npm run dev
npm run build
npm run lint
```

## Troubleshooting

- Wallet not connected: click "Connect Wallet" in header.
- Wrong network: switch to Sepolia in MetaMask.
- Empty file list: ensure you are using the same wallet that uploaded files.
- Decryption fails: verify passphrase and CID integrity.
- Pinata upload fails: validate API credentials in `.env.local`.

## Roadmap Ideas

- Move Pinata upload to secure server route (avoid exposing API secret)
- Add file metadata indexing and search
- Add wallet-based sharing and access policies
- Add contract events + subgraph/indexer support

## License

No license file is currently included. Add a `LICENSE` file before open-source distribution.
