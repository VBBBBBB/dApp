import { useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileUp, CheckCircle, XCircle, Wallet, LayoutGrid, Search, Loader2 } from 'lucide-react';
import './App.css';

// --- CONTRACT CONFIG ---
const CONTRACT_ADDRESS = "0xcE61526047eEaAF430D6d196AD3DaBA00445BC25";
const ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "sId", "type": "uint256" },
      { "internalType": "string", "name": "cID", "type": "string" },
      { "internalType": "bytes32", "name": "_fhash", "type": "bytes32" }
    ],
    "name": "storeCredentials",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "Certs",
    "outputs": [
      { "internalType": "string", "name": "cID", "type": "string" },
      { "internalType": "bytes32", "name": "fhash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// --- PINATA CONFIG ---
const PINATA_API_KEY = "3b051e96866c60013213";
const PINATA_SECRET = "2974e6b94bd171ce6fa255551502cb1f104493f98c1abd0a42cc0eb0ad0bbcfa";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; msg: string }>({ type: 'idle', msg: '' });
  
  // Issue Forms
  const [issueId, setIssueId] = useState('');
  const [issueFile, setIssueFile] = useState<File | null>(null);

  // Verify Forms
  const [verifyId, setVerifyId] = useState('');
  const [verifyFile, setVerifyFile] = useState<File | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        console.log("Connected Signer Address:", accounts[0]);
      } catch (err) {
        console.error("Connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const getFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET,
        },
        body: formData,
      },
    );

    const data = await res.json();
    if (!data.IpfsHash) throw new Error("Failed to upload to IPFS");
    return data.IpfsHash;
  };

  const handleIssue = async () => {
    if (!account || !issueId || !issueFile) return;
    setLoading(true);
    setStatus({ type: 'idle', msg: '' });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      // 1. Hash File
      setStatus({ type: 'idle', msg: 'Hashing the file...' });
      const fhash = await getFileHash(issueFile);
      
      // 2. Upload to IPFS
      setStatus({ type: 'idle', msg: 'Storing file in IPFS (via Pinata)...' });
      const cid = await uploadToIPFS(issueFile);
      console.log("IPFS CID:", cid);

      // 3. Store in Blockchain
      setStatus({ type: 'idle', msg: 'Confirming with blockchain...' });
      
      // Adding manual gas settings to help MetaMask on custom networks
      const tx = await contract.storeCredentials(BigInt(issueId), cid, fhash, {
        gasLimit: 300000 
      });
      
      setStatus({ type: 'success', msg: 'Transaction submitted! Waiting for confirmation...' });
      await tx.wait();
      setStatus({ type: 'success', msg: `Successfully issued credential! CID: ${cid}` });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: err.reason || err.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyId || !verifyFile) return;
    setLoading(true);
    setStatus({ type: 'idle', msg: '' });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const onChainData = await contract.Certs(BigInt(verifyId));
      const currentHash = await getFileHash(verifyFile);

      if (onChainData.fhash === currentHash) {
        setStatus({ type: 'success', msg: '✅ Verification Successful! The certificate is authentic.' });
      } else {
         setStatus({ type: 'error', msg: '❌ Verification Failed! The certificate has been tampered with or does not match.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Verification failed or record not found.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Shield />
          <span>Certi<span className="gradient-text">Verify</span></span>
        </div>
        
        {account ? (
          <div className="connected-badge">
            <div className="dot" />
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            <Wallet size={18} />
            Connect Wallet
          </button>
        )}
      </header>

      <main className="hero">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Secure Your <span className="gradient-text">Credentials</span> on-chain.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          An immutable, transparent, and secure infrastructure for educational certificate verification powered by Blockchain technology.
        </motion.p>
      </main>

      <section className="cards-grid">
        {/* ISSUE CARD */}
        <motion.div 
          className="card glass"
          whileHover={{ y: -8 }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2><FileUp /> Issue Transcript</h2>
          
          <div className="input-group">
            <label>Student ID</label>
            <input 
              type="number" 
              placeholder="e.g. 1001" 
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Upload Certificate</label>
            <div className="file-input-wrapper">
              <input type="file" onChange={(e) => setIssueFile(e.target.files?.[0] || null)} />
              <div className="file-info">
                <LayoutGrid />
                <span>{issueFile ? issueFile.name : "Drag & drop or click to upload"}</span>
              </div>
            </div>
          </div>

          <button 
            className="action-btn issue-btn" 
            onClick={handleIssue}
            disabled={loading || !account || !issueFile || !issueId}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Issue Credentials"}
          </button>
        </motion.div>

        {/* VERIFY CARD */}
        <motion.div 
          className="card glass"
          whileHover={{ y: -8 }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2><Search /> Verify Transcript</h2>
          
          <div className="input-group">
            <label>Student ID</label>
            <input 
              type="number" 
              placeholder="e.g. 1001"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Upload Certificate to Check</label>
            <div className="file-input-wrapper">
              <input type="file" onChange={(e) => setVerifyFile(e.target.files?.[0] || null)} />
              <div className="file-info">
                <LayoutGrid />
                <span>{verifyFile ? verifyFile.name : "Drag & drop or click to upload"}</span>
              </div>
            </div>
          </div>

          <button 
            className="action-btn verify-btn"
            onClick={handleVerify}
            disabled={loading || !verifyFile || !verifyId}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Verify Credentials"}
          </button>
        </motion.div>
      </section>

      <AnimatePresence>
        {status.msg && (
          <motion.div 
            className={`status-msg ${status.type}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {status.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ marginTop: '80px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Built with ❤️ on Hoodi L1 • Powered by Hardhat 3
      </footer>
    </div>
  );
}

export default App;
