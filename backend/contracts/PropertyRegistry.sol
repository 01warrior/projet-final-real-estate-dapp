pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol"; // Pour une gestion facile du propriétaire du contrat

contract PropertyRegistry is Ownable {

     // Hérite de Ownable pour avoir le modificateur onlyOwner et la fonction transferOwnership dont jaurai besoin

    // --- Structure pour une propriété ---
    struct Property {
        uint id;                // ID unique de la propriété
        address currentOwner;   // Propriétaire actuel
        string ipfsHash;        // Hash IPFS des documents
        string description;     // Description textuelle
        address[] previousOwnersHistory; // Historique des propriétaires
    }

    // --- Variables d'état ---
    uint256 private _propertyIdCounter; // Compteur privé pour les IDs de propriété

    mapping(uint => Property) public properties; // Stocke les propriétés par leur ID


    // --- Événements ---
    event PropertyAdded(
        uint indexed propertyId,
        address indexed currentOwner,
        string ipfsHash,
        string description
    );

    event PropertyTransferred(
        uint indexed propertyId,
        address indexed from,
        address indexed to,
        string ipfsHash // aussi inclure le hash ici pour info
    );

    // --- Constructeur ---
    constructor(address initialOwner) Ownable(initialOwner) {
        // Le constructeur Ownable nécessite un paramètre initialOwner
    }

    // --- Fonctions ---

    /**
     * @dev Ajoute une nouvelle propriété au registre. Seul le propriétaire du contrat peut le faire.
     * @param _initialOwner L'adresse du premier propriétaire de la propriété.
     * @param _ipfsHash Le hash IPFS pointant vers les documents de la propriété.
     * @param _description Une description de la propriété.
     */
     
    function addProperty(address _initialOwner, string memory _ipfsHash, string memory _description) public onlyOwner {
        require(_initialOwner != address(0), "PropertyRegistry: Initial owner cannot be the zero address");
        require(bytes(_ipfsHash).length > 0, "PropertyRegistry: IPFS hash cannot be empty");
        require(bytes(_description).length > 0, "PropertyRegistry: Description cannot be empty");

        _propertyIdCounter++; // Incrémente le compteur AVANT de l'utiliser pour le nouvel ID
        uint newPropertyId = _propertyIdCounter;

        properties[newPropertyId] = Property({
            id: newPropertyId,
            currentOwner: _initialOwner,
            ipfsHash: _ipfsHash,
            description: _description,
            previousOwnersHistory: new address[](0) // Initialise un tableau vide pour l'historique
        });

        emit PropertyAdded(newPropertyId, _initialOwner, _ipfsHash, _description);
    }

    /**
     * @dev Transfère la propriété d'un bien à un nouveau propriétaire.
     * Seul le propriétaire actuel du bien peut initier le transfert.
     * @param _propertyId L'ID du bien à transférer.
     * @param _newOwner L'adresse du nouveau propriétaire.
     */

    function transferProperty(uint _propertyId, address _newOwner) public {
        require(properties[_propertyId].id != 0, "PropertyRegistry: Property does not exist"); // Vérifie si la propriété existe (id non nul)
        require(_newOwner != address(0), "PropertyRegistry: New owner cannot be the zero address");

        Property storage propertyToTransfer = properties[_propertyId]; // Crée une référence de stockage pour modifier directement

        require(msg.sender == propertyToTransfer.currentOwner, "PropertyRegistry: Only the current owner can transfer the property");
        require(_newOwner != propertyToTransfer.currentOwner, "PropertyRegistry: New owner cannot be the current owner");

        address oldOwner = propertyToTransfer.currentOwner;

        // Ajoute l'ancien propriétaire à l'historique
        propertyToTransfer.previousOwnersHistory.push(oldOwner);

        // Met à jour le propriétaire actuel
        propertyToTransfer.currentOwner = _newOwner;

        emit PropertyTransferred(_propertyId, oldOwner, _newOwner, propertyToTransfer.ipfsHash);
    }

    /**
     * @dev Récupère les détails d'une propriété spécifique.
     * @param _propertyId L'ID de la propriété à consulter.
     * @return Les détails de la propriété.
     */
    function getProperty(uint _propertyId) public view returns (Property memory) {
        require(properties[_propertyId].id != 0, "PropertyRegistry: Property does not exist");
        return properties[_propertyId];
    }

    /**
     * @dev Récupère l'historique des propriétaires d'une propriété spécifique.
     * @param _propertyId L'ID de la propriété.
     * @return Un tableau des adresses des anciens propriétaires.
     */
    function getPropertyHistory(uint _propertyId) public view returns (address[] memory) {
        require(properties[_propertyId].id != 0, "PropertyRegistry: Property does not exist");
        return properties[_propertyId].previousOwnersHistory;
    }

    /**
     * @dev Récupère le nombre total de propriétés enregistrées.
     * @return Le nombre total de propriétés.
     */
     
    function getTotalProperties() public view returns (uint) {
        return _propertyIdCounter;
    }
}