const { ethers } = require("hardhat");

async function main() {
  console.log("Déploiement de PropertyRegistry...");

  // Récupérer les comptes
  const [deployer] = await ethers.getSigners();
  
  console.log("Déploiement avec le compte:", deployer.address);
  console.log("Solde du compte:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Déployer le contrat avec l'adresse du déployeur comme propriétaire initial
  const PropertyRegistry = await ethers.getContractFactory("PropertyRegistry");
  const propertyRegistry = await PropertyRegistry.deploy(deployer.address);

  // Attendre que le déploiement soit confirmé
  await propertyRegistry.waitForDeployment();

  console.log("✅ PropertyRegistry déployé à l'adresse:", await propertyRegistry.getAddress());
  console.log("👤 Propriétaire du contrat:", deployer.address);
  
  // Vérifier que le déploiement a fonctionné
  const totalProperties = await propertyRegistry.getTotalProperties();
  console.log("📊 Nombre initial de propriétés:", totalProperties.toString());
  
  // Optionnel : Afficher les informations de transaction
  const deployTx = propertyRegistry.deploymentTransaction();
  console.log("🔗 Hash de transaction de déploiement:", deployTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });