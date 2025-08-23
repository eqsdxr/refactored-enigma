import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEUserRegistry, FHEUserRegistry__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  gideon: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEUserRegistrySepolia")) as FHECounter__factory;
  const fheUserRegistryContract = (await factory.deploy()) as FHEUserRegistry;
  const fheUserRegistryContractAddress = await fheUserRegistryContract.getAddress();

  return { fheUserRegistryContract, fheUserRegistryContractAddress };
}

describe("FHEUserRegistry", function () {
  let signers: Signers;
  let fheUserRegistryContract: FHEUserRegistry;
  let fheUserRegistryContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const FHEUserRegistryDeployment = await deployments.get("FHEUserRegistry");
      fheUserRegistryAddress = FHEUserRegistryDeployment.address;
      fheUserRegistryContract = await ethers.getContractAt("FHEUserRegistry", FHEUserRegistryDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("Add new social media indicator for Gideon and try to update it", async function () {
    steps = 11;

    this.timeout(4 * 40000);


    progress("Checking value before reg")

    const encryptedUserSocialMediaIndicatorBeforeReg = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);
    expect(encryptedUserSocialMediaIndicatorBeforeReg).to.eq(ethers.ZeroHash);

    progress("Encrypting '1'...");

    // Encrypt constant 1 as a euint256
    const clearExpectedValue = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(fheUserRegistryContractAddress, signers.gideon.address)
      .add256(clearExpectedValue)
      .encrypt();

    progress(
      `Call registerUser(1) FHEUserRegistry=${fheUserRegistryContractAddress} handle=${ethers.hexlify(encryptedValue.handles[0])} signer=${signers.gideon.address}...`,
    );

    const tx = await fheUserRegistryContract
      .connect(signers.gideon)
      .registerUser(signers.gideon.address, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    progress(`Call FHEUserRegistry.getUserSocialMediaIndicator()...`);

    const encryptedSocialMediaIndicatorAfterReg = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);

    progress(`Decrypting FHEUserRegistry.getUserSocialMediaIndicator()=${encryptedSocialMediaIndicatorBeforeReg}...`);

    const clearSocialMediaIndicatorAfterReg = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedSocialMediaIndicatorAfterReg,
      fheUserRegistryContract,
      signers.gideon,
    );

    progress(`Clear FHEUserRegistry.getUserSocialMediaIndicator()=${clearSocialMediaIndicatorAfterReg}`);

    expect(clearSocialMediaIndicatorAfterReg).to.eq(clearExpectedValue);

    // Check update functionality

    progress("Encrypting '128735'...");

    const clearExpectedValue2 = 128735;
    const encryptedValue2 = await fhevm
      .createEncryptedInput(fheUserRegistryContractAddress, signers.gideon.address)
      .add256(clearExpectedValue2)
      .encrypt();

    progress(
      `Call registerUser(128735) FHEUserRegistry=${fheUserRegistryContractAddress} handle=${ethers.hexlify(encryptedValue.handles[0])} signer=${signers.gideon.address}...`,
    );

    const tx2 = await fheUserRegistryContract
      .connect(signers.gideon)
      .registerUser(signers.gideon.address, encryptedValue2.handles[0], encryptedValue2.inputProof);
    await tx2.wait();

    progress(`Call FHEUserRegistry.getUserSocialMediaIndicator()...`);

    const encryptedSocialMediaIndicatorAfterReg2 = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);

    progress(`Decrypting FHEUserRegistry.getUserSocialMediaIndicator()=${encryptedSocialMediaIndicatorBeforeReg}...`);

    const clearSocialMediaIndicatorAfterReg2 = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedSocialMediaIndicatorAfterReg2,
      fheUserRegistryContract,
      signers.gideon,
    );

    progress(`Clear FHEUserRegistry.getUserSocialMediaIndicator()=${clearSocialMediaIndicatorAfterReg}`);

    expect(clearSocialMediaIndicatorAfterReg2).to.eq(clearExpectedValue2);
  });
});
