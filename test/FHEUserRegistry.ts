import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEUserRegistry, FHEUserRegistry__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  gideon: HardhatEthersSigner;
  miriam: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEUserRegistry")) as FHECounter__factory;
  const fheUserRegistryContract = (await factory.deploy()) as FHEUserRegistry;
  const fheUserRegistryContractAddress = await fheUserRegistryContract.getAddress();

  return { fheUserRegistryContract, fheUserRegistryContractAddress };
}

describe("FHEUserRegistry", function () {
  let signers: Signers;
  let fheUserRegistryContract: FHEUserRegistry;
  let fheUserRegistryContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], gideon: ethSigners[1], miriam: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fheUserRegistryContract, fheUserRegistryContractAddress } = await deployFixture());
  });

  it("encrypted social media indicator should be uninitialized after deployment", async function () {
    const encryptedUserSocialMediaIndicator = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);
    // Expect initial count to be bytes256(0) after deployment,
    // (meaning the encrypted count value is uninitialized)
    expect(encryptedUserSocialMediaIndicator).to.eq(ethers.ZeroHash);
  });

  it("Add new social media indicator for Gideon and try to update it", async function () {
    const encryptedUserSocialMediaIndicatorBeforeReg = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);
    expect(encryptedUserSocialMediaIndicatorBeforeReg).to.eq(ethers.ZeroHash);

    // Encrypt constant 1 as a euint256
    const clearExpectedValue = 1;
    const encryptedOne = await fhevm
      .createEncryptedInput(fheUserRegistryContractAddress, signers.gideon.address)
      .add256(clearExpectedValue)
      .encrypt();

    const tx = await fheUserRegistryContract
      .connect(signers.gideon)
      .registerUser(signers.gideon.address, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedSocialMediaIndicatorAfterReg = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);

    const clearSocialMediaIndicatorAfterReg = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedSocialMediaIndicatorAfterReg,
      fheUserRegistryContract,
      signers.gideon,
    );

    expect(clearSocialMediaIndicatorAfterReg).to.eq(clearExpectedValue);

    // Check update functionality

    const clearExpectedValue2 = 128735;
    const encryptedValue2 = await fhevm
      .createEncryptedInput(fheUserRegistryContractAddress, signers.gideon.address)
      .add256(clearExpectedValue2)
      .encrypt();

    const tx2 = await fheUserRegistryContract
      .connect(signers.gideon)
      .registerUser(signers.gideon.address, encryptedValue2.handles[0], encryptedValue2.inputProof);
    await tx2.wait();

    const encryptedSocialMediaIndicatorAfterReg2 = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.gideon.address);

    const clearSocialMediaIndicatorAfterReg2 = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedSocialMediaIndicatorAfterReg2,
      fheUserRegistryContract,
      signers.gideon,
    );

    expect(clearSocialMediaIndicatorAfterReg2).to.eq(clearExpectedValue2);

  });

  it("Add new social media indicator for Miriam", async function () {
    const encryptedCountBeforeInc = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.miriam.address);
    expect(encryptedCountBeforeInc).to.eq(ethers.ZeroHash);

    // Encrypt constant 1 as a euint256
    const clearExpectedValue = 7832568583;
    const encryptedOne = await fhevm
      .createEncryptedInput(fheUserRegistryContractAddress, signers.miriam.address)
      .add256(clearExpectedValue)
      .encrypt();

    const tx = await fheUserRegistryContract
      .connect(signers.miriam)
      .registerUser(signers.miriam.address, encryptedOne.handles[0], encryptedOne.inputProof);
    await tx.wait();

    const encryptedSocialMediaIndicatorAfterReg = await fheUserRegistryContract.getUserSocialMediaIndicator(signers.miriam.address);

    const clearSocialMediaIndicatorAfterReg = await fhevm.userDecryptEuint(
      FhevmType.euint256,
      encryptedSocialMediaIndicatorAfterReg,
      fheUserRegistryContract,
      signers.miriam,
    );

    expect(clearSocialMediaIndicatorAfterReg).to.eq(clearExpectedValue);
  });
});
