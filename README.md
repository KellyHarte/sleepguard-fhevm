# SleepGuard - Privacy-Preserving Sleep Tracking DApp

SleepGuard is a privacy-preserving sleep tracking DApp built on FHEVM (Fully Homomorphic Encryption Virtual Machine). Users can securely submit encrypted sleep data including bedtime, wake time, duration, deep sleep ratio, and sleep scores without revealing personal information. The application leverages FHEVM's encrypted computation capabilities to calculate global statistics while maintaining individual privacy.

## 🌟 Features

- **🔐 Privacy-First**: All sleep data is encrypted on-chain using FHEVM
- **📊 Encrypted Analytics**: Calculate global statistics without revealing individual data
- **🔑 Selective Decryption**: Users control who can decrypt their data
- **🌐 Multi-Network**: Supports both local development (Mock FHEVM) and Sepolia testnet
- **💳 MetaMask Integration**: Seamless wallet connection with EIP-6963 support
- **📱 Modern UI**: Responsive design with Glassmorphism aesthetics

## 🏗️ Architecture

### Smart Contract (`SleepGuard.sol`)
- **Encrypted Storage**: Uses `euint16`, `euint8`, `euint64` for encrypted data
- **Access Control**: Implements `FHE.allow()` for selective decryption authorization
- **Global Aggregation**: Calculates encrypted sums for privacy-preserving statistics
- **Profile Management**: User profiles with privacy settings

### Frontend (`sleepguard-frontend/`)
- **Next.js 14**: Modern React framework with App Router
- **FHEVM Integration**: Dual-mode support (Mock for local, Relayer SDK for testnet)
- **Wallet Management**: MetaMask provider with persistent connection
- **Encrypted UI**: Complete encrypt→submit→decrypt workflow

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask wallet
- Git

### 1. Clone Repository
```bash
git clone https://github.com/KellyHarte/sleepguard-fhevm.git
cd sleepguard-fhevm
```

### 2. Install Dependencies
```bash
# Install contract dependencies
cd fhevm-hardhat-template
npm install

# Install frontend dependencies
cd ../sleepguard-frontend
npm install
```

### 3. Local Development

#### Terminal 1: Start Hardhat Node
```bash
cd fhevm-hardhat-template
npx hardhat node
```

#### Terminal 2: Deploy Contracts
```bash
cd fhevm-hardhat-template
npx hardhat deploy --network localhost
```

#### Terminal 3: Start Frontend (Mock Mode)
```bash
cd sleepguard-frontend
npm run dev:mock
```

Visit `http://localhost:3000` and connect your MetaMask to `localhost:8545`

### 4. Sepolia Testnet

#### Configure Environment (Optional)
```bash
cd fhevm-hardhat-template
npx hardhat vars set MNEMONIC "your twelve word mnemonic here"
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"
```

#### Deploy to Sepolia
```bash
cd fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

#### Start Frontend (Relayer Mode)
```bash
cd sleepguard-frontend
npm run dev
```

Switch MetaMask to Sepolia network and visit `http://localhost:3000`

## 📋 Usage

1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Create Profile**: Set up your profile with privacy preferences
3. **Submit Sleep Data**: Enter your sleep metrics (encrypted automatically)
4. **View Personal Stats**: Decrypt and view your historical data
5. **Check Global Stats**: View aggregated statistics (privacy-preserving)

## 🔧 Development

### Project Structure
```
├── fhevm-hardhat-template/     # Smart contracts
│   ├── contracts/
│   │   └── SleepGuard.sol     # Main contract
│   ├── deploy/                # Deployment scripts
│   ├── test/                  # Contract tests
│   └── tasks/                 # Hardhat tasks
├── sleepguard-frontend/       # Frontend application
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── fhevm/                 # FHEVM integration
│   └── abi/                   # Generated contract ABIs
└── frontend/                  # Reference implementation (read-only)
```

### Key Commands

#### Contract Development
```bash
cd fhevm-hardhat-template

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy locally
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

#### Frontend Development
```bash
cd sleepguard-frontend

# Development (Mock FHEVM)
npm run dev:mock

# Development (Real Relayer)
npm run dev

# Build for production
npm run build

# Generate ABI files
npm run genabi
```

## 🔐 FHEVM Integration

### Encryption Flow
1. **Input Encryption**: User data encrypted client-side using FHEVM SDK
2. **On-Chain Storage**: Encrypted data stored in smart contract
3. **Computation**: Homomorphic operations on encrypted data
4. **Selective Decryption**: Authorized users can decrypt specific data

### Dual-Mode Support
- **Mock Mode** (`chainId: 31337`): Uses `@fhevm/mock-utils` for local development
- **Relayer Mode** (`chainId: 11155111`): Uses `@zama-fhe/relayer-sdk` for Sepolia

## 🌐 Deployed Contracts

### Sepolia Testnet
- **SleepGuard**: `0xbfBADf24CfB5eF26C1D0eeF9967F440F48df7D46`
- **FHECounter**: `0xBB1Db0d79670dCD55Fe0b56565b790a14e1e5657`

### Localhost (Development)
Addresses change with each deployment - check console output or `deployments/localhost/`

## 🎨 Design System

The UI uses a deterministic design system based on project characteristics:
- **Design System**: Glassmorphism
- **Color Scheme**: Blue/Cyan/Teal (Professional/Tech)
- **Typography**: Sans-Serif (Inter) with 1.25 scale
- **Layout**: Sidebar navigation
- **Components**: Medium rounded corners, subtle shadows
- **Animations**: 200ms standard transitions

## 🧪 Testing

### Contract Tests
```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Frontend Testing
```bash
cd sleepguard-frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for development framework
- [Next.js](https://nextjs.org/) for frontend framework
- [MetaMask](https://metamask.io/) for wallet integration

## 🔗 Links

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

**Built with ❤️ using FHEVM for privacy-preserving healthcare applications**
