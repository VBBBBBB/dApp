# 🎓 VerifyCertificate dApp

A premium decentralized application for storing and verifying educational certificates on the blockhain. Built with **Hardhat 3 (Beta)** and deployed on the **Hoodi L1 Network**.

---

## 🚀 Overview

**VerifyCertificate** is designed to provide an immutable and transparent way to manage academic credentials. By leveraging blockchain technology, we ensure that certificates cannot be forged or tampered with once stored.

### Key Features
- **Immutable Storage**: Securely store certificate IDs and file hashes on-chain.
- **Fast Transactions**: Optimized for the Hoodi L1 network for high performance and low latency.
- **Hardhat 3 Integration**: Uses the latest features of Hardhat 3, including Ignition for deployment and the new configuration system.

---

## 📂 Project Structure

```text
├── hardhat/
│   ├── contracts/          # Solidity smart contracts (CertVerify)
│   ├── ignition/           # Deployment modules and history
│   ├── test/               # Mocha and Ethers.js integration tests
│   ├── .env                # Environment configuration (RPC & Private Key)
│   └── hardhat.config.ts   # Hardhat 3 configuration
└── README.md               # Main project documentation
```

---

## 🛠 Tech Stack

- **Solidity**: v0.8.30
- **Framework**: Hardhat v3.2.0
- **Language**: TypeScript
- **Network**: Hoodi L1

---

## ⚡ Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### 2. Installation
Navigate to the `hardhat` directory and install dependencies:
```bash
cd hardhat
npm install
```

### 3. Compilation
Compile the smart contracts to generate artifacts:
```bash
npx hardhat compile
```

### 4. Deployment
The contract is already deployed on the Hoodi network. To redeploy or deploy to another network:
```bash
# Deploy to Hoodi
npx hardhat ignition deploy ignition/modules/Counter.ts --network hoodi

# Deploy to Sepolia (if configured)
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

---

## 📝 Smart Contract API

### `CertVerify.sol`

| Function | Parameters | Description |
| :--- | :--- | :--- |
| `storeCredentials` | `uint256 sId, string cId, bytes32 fhash` | Stores the student ID, certificate ID, and document hash. |
| `Certs` | `uint256 sId` | Public mapping to retrieve certificate data by student ID. |

---

## 📬 Contact & Support

For any questions or support, feel free to open an issue in this repository.

Developed with ❤️ using **Hardhat 3**.
