import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VerifyModule", (m) => {
  const counter = m.contract("CertVerify");

  return { counter };
});
