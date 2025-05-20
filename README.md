## 🚀 KaiNFT Marketplace

Kai NFT Marketplace is a decentralized platform for trading ERC-1155 NFTs and fungible tokens (FTs) on the Ethereum blockchain. The project includes custom smart contracts for NFT minting, a marketplace with fee support, a gacha (lucky draw) system, and robust security mechanisms. It is built using Solidity and Hardhat, and leverages OpenZeppelin for security and standardization.
📸 **Want to see it in action?**  
Check out our on-chain demo here:  
👉 [`📊 Live Transaction Examples`](./docs/demo.md)

### 🔧 Tech Stack
- Solidity (ERC-1155, ERC-20)
- Hardhat + TypeScript
- The Graph (Subgraph for on-chain events)
- Pinata + IPFS for metadata

## Features
- **KaiNftToken**: ERC-1155 contract supporting both NFTs and FTs, with per-token metadata URIs and owner-only minting.
- **KaiMarketplace1155**: Marketplace contract for listing, buying, and canceling NFT sales, with fee distribution to a treasury address and reentrancy protection.
- **KaiGacha**: Gacha contract allowing users to spend KAI tokens for a chance to win NFTs, with configurable draw price and reward chances.
- **KAI Token**: ERC-20 token used as the main currency for marketplace and gacha operations.


## Advantages & Security Features

- **Reentrancy Protection:** All critical marketplace functions (such as buying and canceling listings) are protected by OpenZeppelin's `ReentrancyGuard`, preventing reentrancy attacks and ensuring the safety of user funds.
- **Modular Smart Contracts:** The system is split into clear modules for NFTs, marketplace, gacha, and token, making it easy to maintain and extend.
- **Per-Token Metadata:** Each NFT or FT can have its own metadata URI, supporting rich and flexible asset representation.
- **Fee Mechanism:** The marketplace supports a configurable fee, automatically distributing a portion of each sale to a treasury address.
- **Gacha System:** Users can participate in a lucky draw to win NFTs, with transparent and configurable odds.
- **Subgraph Integration:** All marketplace activity is indexed and queryable via The Graph, enabling real-time analytics and dApp integration.
- **OpenZeppelin Standards:** Built on top of OpenZeppelin contracts for ERC-20, ERC-1155, and security best practices.
- **Comprehensive Testing:** Includes tests for all major features, including reentrancy attack scenarios.

## ReentrancyGuard Mechanism

The marketplace contract (`KaiMarketplace1155`) uses OpenZeppelin's `ReentrancyGuard` to protect all functions that transfer tokens or NFTs. This prevents malicious contracts from exploiting reentrancy vulnerabilities (where a contract could repeatedly call back into a function before the first invocation finishes, potentially draining funds or bypassing logic).

**How it works:**
- The `nonReentrant` modifier is applied to functions like `buy()` and `cancel()`, ensuring that no nested (reentrant) calls can be made to them.
- This is a proven and widely adopted security pattern in the Ethereum ecosystem.
- The project includes dedicated tests to verify that reentrancy attacks are not possible.

**Benefits:**
- Protects user funds from one of the most common and dangerous smart contract attacks.
- Increases trust and reliability for users and integrators.

## Subgraph (The Graph Integration)

This project provides two deployed subgraphs for real-time indexing and querying of marketplace and NFT activity using [The Graph](https://thegraph.com/).

### Querying the Subgraphs

You can fetch data from the subgraphs using GraphQL queries via HTTP POST requests. Below are example `curl` commands for each subgraph:

#### 1. Marketplace Subgraph (`kai-marketplace-1155`)
Query for the latest purchases (`boughts`), listings (`listeds`), and cancellations (`cancelleds`):

```sh
curl --location 'https://api.studio.thegraph.com/query/111625/kai-marketplace-1155/version/latest' \
--header 'Content-Type: application/json' \
--header 'Cookie: __cf_bm=lknfqjnW.WsgsBbdG3rbRc2IEE2QFIaEzFnrTMm0btA-1747728634-1.0.1.1-1VdVYhb1QeJo952hT_1fJznea8Yt5.iRlm2cQ9Y.2D.ntNAOufsktC1w_HVJ2dIjIJR80H7NY9F1wvhRQs4zSQ0oPPxwFMmd7pd9UZihGTg' \
--data '{
  "query": "query GetMarketplaceData {\n  boughts(first: 5) {\n    id\n    listingId\n    buyer\n    amount\n  }\n  listeds(first: 5) {\n    listingId\n    id\n    tokenId\n    amount\n    price\n  }\n  cancelleds(first: 5) {\n    id\n    listingId\n    blockNumber\n    blockTimestamp\n  }\n}"
}
'
```

#### 2. NFT Subgraph (`kai-nft`)
Query for the latest minted NFT events:

```sh
curl -X POST https://api.studio.thegraph.com/query/111625/kai-nft/version/latest \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetMintedEvents {\n  tokenMinteds(first: 10, orderBy: blockTimestamp, orderDirection: desc) {\n    id\n    to\n    tokenId\n    amount\n    uri\n    blockTimestamp\n  }\n}"
  }'
```

For more details on available entities and fields, see the subgraph's GraphQL schema or The Graph documentation.

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Yarn or npm
- Hardhat

### Installation
```sh
npm install
```

### Compile Contracts
```sh
npx hardhat compile
```

### Run Tests
```sh
npx hardhat test
```

### Deployment
Set environment variables in a `.env` file:
```
TOKEN_ADDRESS=<KAI Token address>
TREASURY_ADDRESS=<Fee recipient address>
FEE_PERCENT=200 # (for 2%)
```
Deploy contracts:
```sh
npx hardhat run deploy/01_deploy_kai_nft.ts --network <network>
npx hardhat run deploy/02_deploy_kai_token.ts --network <network>
npx hardhat run deploy/03_deploy_kai_marketplace_1155.ts --network <network>
```

### Verify Contracts
```sh
npx hardhat verify --network <network> <contract_address> <constructor_args>
```

## Project Structure
- `contracts/` — Solidity smart contracts
- `test/` — Hardhat/Chai test scripts
- `deploy/` — Deployment scripts
- `subgraph/` — The Graph subgraph definition and mappings

## License
MIT
