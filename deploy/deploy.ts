import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log(`Deployer: `, deployer);

  const deployedFHEUserRegistry = await deploy("FHEUserRegistry", {
    from: deployer,
    log: true,
  });

  console.log(`FHEUserRegistry contract: `, deployedFHEUserRegistry.address);
};
export default func;
func.id = "deploy_fheUserRegistry"; // id required to prevent reexecution
func.tags = ["FHEUserRegistry"];
