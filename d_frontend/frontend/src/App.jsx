import React, { useState, useEffect, useCallback } from 'react';
import { ethers, isAddress } from 'ethers';
import { create } from 'ipfs-http-client';

// Artefact et config
import PropertyRegistryArtifact from './contracts/PropertyRegistry.json';
import { PROPERTY_REGISTRY_CONTRACT_ADDRESS, IPFS_API_URL, IPFS_GATEWAY_URL } from './config'; 

// Composants de Layout
import Sidebar from './components/layout/Sidebar.jsx';
import Header from './components/layout/Header.jsx';

// Composants UI shadcn
import { Toaster } from "@/components/ui/sonner"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // On l'utilisera apres
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet as WalletIcon, ListChecks, PlusCircle, History as HistoryIcon, Home as HomeIcon,Users as UsersIcon,  } from 'lucide-react'; // Icônes
import { toast } from "sonner";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [ipfs, setIpfs] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [currentView, setCurrentView] = useState('properties'); // 'dashboard', 'properties', 'addProperty'

  // États pour le formulaire d'ajout (contrôlé par la modale)
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [newPropertyOwner, setNewPropertyOwner] = useState('');
  const [newPropertyDescription, setNewPropertyDescription] = useState('');
  const [propertyFiles, setPropertyFiles] = useState([]);
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  // États pour le transfert (contrôlé par la modale)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferTargetProperty, setTransferTargetProperty] = useState(null); // Stocke l'objet propriété entier
  const [newOwnerAddressInput, setNewOwnerAddressInput] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // États pour l'historique (contrôlé par la modale)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [propertyHistory, setPropertyHistory] = useState([]);
  const [historyTargetId, setHistoryTargetId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // État pour la liste des propriétés
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  //pour le modal IPFS dans lequel on peut lister les fichiers d'un dossier IPFS
  const [isIpfsDocsDialogOpen, setIsIpfsDocsDialogOpen] = useState(false);
  const [currentIpfsFolderCid, setCurrentIpfsFolderCid] = useState(null);
  const [ipfsFolderContents, setIpfsFolderContents] = useState([]); // Pour lister les fichiers du dossier
  const [isLoadingIpfsFolder, setIsLoadingIpfsFolder] = useState(false);


  const loadProperties = useCallback(async (contractInstance) => {
    if (!contractInstance) return;
    setIsLoadingProperties(true);
    try {
      const totalPropsBigInt = await contractInstance.getTotalProperties();
      const totalProps = Number(totalPropsBigInt);
      const loadedProps = [];
      for (let i = 1; i <= totalProps; i++) {
        try {
          const p = await contractInstance.getProperty(i);
          loadedProps.push({
            id: Number(p.id), currentOwner: p.currentOwner, ipfsHash: p.ipfsHash, description: p.description,
            previousOwnersHistory: p.previousOwnersHistor
          });
        } catch (loopError) { console.error(`Erreur chargement prop ID ${i}:`, loopError); }
      }
      setProperties(loadedProps);
      if (loadedProps.length === 0 && totalProps === 0) {
        toast.info("Info", {
          description: "Aucune propriété enregistrée.",
          duration: 3000 // La durée en millisecondes
        });
      }
    } catch (error) {
      console.error("Erreur chargement propriétés:", error);
      toast.error("Erreur Chargement", { 
        description: "Impossible de charger les propriétés depuis la blockchain."
      });
    } finally {
      setIsLoadingProperties(false);
    }
  }, [toast]);


  const openIpfsDocsDialog = async (propertyIpfsHash) => {
    if (!ipfs) {
        toast.error("Erreur IPFS", { description: "Client IPFS non initialisé." });
        return;
    }
    setCurrentIpfsFolderCid(propertyIpfsHash);
    setIsIpfsDocsDialogOpen(true);
    setIsLoadingIpfsFolder(true);
    setIpfsFolderContents([]); // Vide le contenu précédent

    try {
        const files = [];
        
        for await (const file of ipfs.ls(propertyIpfsHash)) {
            files.push({
                name: file.name,
                cid: file.cid.toString(),
                type: file.type, //que ca soit 'file' ou 'dir'
                size: file.size,
            });
        }
        setIpfsFolderContents(files);
        if (files.length === 0) {
            toast.info("Dossier IPFS", { description: "Ce dossier IPFS est vide ou inaccessible."});
        }
    } catch (error) {
        console.error("Erreur lors du listage du contenu du dossier IPFS:", error);
        toast.error("Erreur IPFS", { description: "Impossible de lister le contenu du dossier." });
        setIpfsFolderContents([]);
    } finally {
        setIsLoadingIpfsFolder(false);
    }
};

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Erreur MetaMask", {
        description: "MetaMask n'est pas installé ou est désactivé. Veuillez installer l'extension.",
        action: { label: "Installer MetaMask", onClick: () => window.open('https://metamask.io/download/', '_blank') }, 
        duration: Infinity,
      });
      return;
    }
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        const web3Signer = await web3Provider.getSigner();
        const propertyRegistryContract = new ethers.Contract(
          PROPERTY_REGISTRY_CONTRACT_ADDRESS,
          PropertyRegistryArtifact.abi,
          web3Signer
        );
        setContract(propertyRegistryContract);
        console.log("Contrat PropertyRegistry initialisé.");

        if (propertyRegistryContract) {
          loadProperties(propertyRegistryContract);
        }

        const contractOwner = await propertyRegistryContract.owner();
        setIsAdmin(currentAccount.toLowerCase() === contractOwner.toLowerCase());
        toast.success("Connecté!", {
          description: `Compte: ${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}` // J'ai complété pour afficher la fin de l'adresse aussi
        });
      } else {
        toast.error( "Échec Connexion", {description: "Aucun compte sélectionné."});
      }
    } catch (error) {
      console.error("Erreur de connexion wallet:", error);
      let message = "Erreur de connexion au portefeuille.";
      if (error.code === 4001) message = "Vous avez refusé la connexion.";
      toast.error("Erreur Connexion", {description: message});
    }
  }, [toast, loadProperties]); // Ajout de loadProperties

  useEffect(() => {
    try {
      const ipfsClient = create({ url: IPFS_API_URL });
      setIpfs(ipfsClient);
      console.log("Client IPFS initialisé.");
    } catch (error) {
      console.error("Erreur d'initialisation IPFS:", error);
    
    }
  }, [toast]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null); setContract(null); setIsAdmin(false); setProperties([]);
          //toast({ title: "Portefeuille Déconnecté", variant: "warning" });
        } else if (account && accounts[0].toLowerCase() !== account.toLowerCase()) {
          
          window.location.reload(); // Forcer une réinitialisation complète pour re-vérifier l'admin et recharger les données
        }
      };
      const handleChainChanged = () => {
       
        window.location.reload();
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, toast]); 

  useEffect(() => {
    if (contract) {
      loadProperties(contract);
    } else {
      setProperties([]);
    }
  }, [contract, loadProperties]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPropertyFiles(Array.from(e.target.files));
    } else {
      setPropertyFiles([]);
    }
  };

  const handleAddPropertySubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!contract || !ipfs) {
   
    }
    if (!isAddress(newPropertyOwner)) {
      
    }
    if (!newPropertyDescription.trim()) {
     
    }
    if (propertyFiles.length === 0) {
      
    }

    setIsAddingProperty(true);
   
    try {
      const filesToIpfs = propertyFiles.map(file => ({ path: file.name, content: file }));
      let directoryCid = '';
      for await (const result of ipfs.addAll(filesToIpfs, { wrapWithDirectory: true })) {
        directoryCid = result.cid.toString();
      }
      if (!directoryCid) throw new Error("Impossible d'obtenir le CID du dossier depuis IPFS.");

      const tx = await contract.addProperty(newPropertyOwner, directoryCid, newPropertyDescription);
      await tx.wait();

      setNewPropertyOwner(''); setNewPropertyDescription(''); setPropertyFiles([]);
      document.getElementById('propertyDocsModal').value = ''; // Vide l'input file
      setIsAddPropertyDialogOpen(false);
      if (contract) loadProperties(contract);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      const reason = error.reason || error.message || "Erreur inconnue.";
     
    } finally {
      setIsAddingProperty(false);
    }
  }, [contract, ipfs, toast, loadProperties, newPropertyOwner, newPropertyDescription, propertyFiles]);

  const openTransferDialog = (property) => {
    setTransferTargetProperty(property);
    setNewOwnerAddressInput('');
    setIsTransferDialogOpen(true);
  };

  const handleTransferSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!contract || !transferTargetProperty) {
     
    }
    if (!isAddress(newOwnerAddressInput)) {
     
    }

    setIsTransferring(true);
    
    try {
      const tx = await contract.transferProperty(transferTargetProperty.id, newOwnerAddressInput);
      await tx.wait();
     
      setIsTransferDialogOpen(false);
      setNewOwnerAddressInput('');
      setTransferTargetProperty(null);
      if (contract) loadProperties(contract);
    } catch (error) {
      console.error("Erreur lors du transfert:", error);
      const reason = error.reason || error.message || "Erreur inconnue.";
     
    } finally {
      setIsTransferring(false);
    }
  }, [contract, toast, loadProperties, newOwnerAddressInput, transferTargetProperty]);

  const openPropertyHistoryDialog = useCallback(async (propertyId) => {
    if (!contract) {
       
    }



    setIsLoadingHistory(true);
    setHistoryTargetId(propertyId); // Pour savoir quelle propriété est concernée
    setPropertyHistory([]); // Vide l'ancien
   
    try {
        const historyArray = await contract.getPropertyHistory(propertyId);
        setPropertyHistory(historyArray);
        setIsHistoryDialogOpen(true); // Ouvre la modale une fois les données chargées
    } catch (error) {
        console.error("Erreur chargement historique:", error);
        const reason = error.reason || "Erreur inconnue.";
      
        setHistoryTargetId(null);
    } finally {
        setIsLoadingHistory(false);
    }
  }, [contract, toast]);


  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-slate-800 dark:text-slate-200">
        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-xl shadow-2xl text-center w-full max-w-md">
          <WalletIcon size={48} className="mx-auto mb-6 text-blue-500" />
          <h1 className="text-3xl font-bold mb-4">ImmoChain</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Connectez votre portefeuille MetaMask pour accéder à la plateforme.
          </p>
          <Button onClick={connectWallet} size="lg" className="w-full">
            <WalletIcon className="mr-2 h-5 w-5" />
            Connecter MetaMask
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50 overflow-hidden">
      <Sidebar
        isAdmin={isAdmin}
        setCurrentView={setCurrentView}
        currentView={currentView}
        onOpenAddPropertyDialog={() => {
          setNewPropertyOwner(''); setNewPropertyDescription(''); setPropertyFiles([]);
          if(document.getElementById('propertyDocsModal')) document.getElementById('propertyDocsModal').value = '';
          setIsAddPropertyDialogOpen(true);
        }}
      />
      <div className="flex-1 flex flex-col">
        <Header account={account} isAdmin={isAdmin} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 lg:p-10">

          {currentView === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                  Tableau de Bord
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Bienvenue, <span className="font-medium">{isAdmin ? 'Administrateur' : 'Utilisateur'}</span> !
                  {account && <span className="font-mono text-xs ml-2 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>}
                </p>
              </div>

              {/* Cartes de statistiques - Exemple */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Propriétés Totales</CardTitle>
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{properties.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Nombre total de biens enregistrés
                    </p>
                  </CardContent>
                </Card>

                {/* Carte pour les propriétés de l'utilisateur (si non admin ou même si admin) */}
                <Card className="shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mes Propriétés</CardTitle>
                    <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {account ? properties.filter(p => p.currentOwner.toLowerCase() === account.toLowerCase()).length : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nombre de biens que vous possédez actuellement
                    </p>
                  </CardContent>
                </Card>

                {isAdmin && (
                  <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Propriétaires Uniques</CardTitle>
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{new Set(properties.map(p => p.currentOwner)).size}</div>
                      <p className="text-xs text-muted-foreground">
                        Nombre d'adresses distinctes possédant des biens
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Section d'actions rapides */}
              <div className="mt-8">
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Actions Rapides</h3>
                  <div className="flex flex-wrap gap-4">
                      <Button onClick={() => setCurrentView('properties')}>
                          <ListChecks className="mr-2 h-4 w-4" /> Consulter Toutes les Propriétés
                      </Button>
                      {isAdmin && (
                          <Button onClick={() => {
                              setNewPropertyOwner(''); setNewPropertyDescription(''); setPropertyFiles([]);
                              if(document.getElementById('propertyDocsModal')) document.getElementById('propertyDocsModal').value = '';
                              setIsAddPropertyDialogOpen(true); // Ouvre la modale d'ajout
                          }}>
                              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Propriété
                          </Button>
                      )}
                   
                  </div>
              </div>

            </div>
          )}

          {currentView === 'properties' && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold">Propriétés Enregistrées</h2>
                {isAdmin && (
                  <Button onClick={() => {
                    setNewPropertyOwner(''); setNewPropertyDescription(''); setPropertyFiles([]);
                    if(document.getElementById('propertyDocsModal')) document.getElementById('propertyDocsModal').value = '';
                    setIsAddPropertyDialogOpen(true);
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Propriété
                  </Button>
                )}
              </div>
              {isLoadingProperties && <p className="text-center py-10">Chargement des propriétés...</p>}
              {!isLoadingProperties && properties.length === 0 && (
                <div className="text-center py-12 text-slate-500"><ListChecks size={48} className="mx-auto mb-4" /><p>Aucune propriété enregistrée.</p></div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(prop => (
                  <Card key={prop.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle>Propriété ID: {prop.id}</CardTitle>
                      <CardDescription className="truncate pt-1">
                        Prop.: <span className="font-mono">{prop.currentOwner.substring(0, 10)}...</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3 h-16">{prop.description}</p>
                      <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => openIpfsDocsDialog(prop.ipfsHash)}
                      >
                          Voir Documents IPFS (CID: {prop.ipfsHash.substring(0,6)}...)
                      </Button>

                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-4 border-t">
                      <Button variant="ghost" size="sm" onClick={() => openPropertyHistoryDialog(prop.id)} className="w-full sm:w-auto">
                        <HistoryIcon className="mr-2 h-4 w-4" />
                        {isLoadingHistory && historyTargetId === prop.id ? "..." : "Historique"}
                      </Button>
                      {account && prop.currentOwner.toLowerCase() === account.toLowerCase() && (
                        <Button size="sm" onClick={() => openTransferDialog(prop)} className="w-full sm:w-auto">
                          Transférer
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modale pour Ajouter une Propriété */}
      <Dialog open={isAddPropertyDialogOpen} onOpenChange={setIsAddPropertyDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Ajouter une Nouvelle Propriété</DialogTitle>
            <DialogDescription>Remplissez les informations et sélectionnez les documents.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPropertySubmit} className="space-y-4 py-2 pb-4">
            <div className="space-y-1">
              <Label htmlFor="ownerAddressModal">Propriétaire Initial</Label>
              <Input id="ownerAddressModal" value={newPropertyOwner} onChange={(e) => setNewPropertyOwner(e.target.value)} placeholder="0x..." disabled={isAddingProperty} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descriptionModal">Description</Label>
              <Textarea id="descriptionModal" value={newPropertyDescription} onChange={(e) => setNewPropertyDescription(e.target.value)} placeholder="Description..." disabled={isAddingProperty} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="propertyDocsModal">Documents</Label>
              <Input id="propertyDocsModal" type="file" multiple onChange={handleFileChange} disabled={isAddingProperty} />
            </div>
            <DialogFooter className="sm:justify-start pt-2">
              <Button type="submit" disabled={isAddingProperty || propertyFiles.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isAddingProperty ? "Ajout en cours..." : "Ajouter Propriété"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isAddingProperty}>Annuler</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modale pour Transférer une Propriété */}
      {transferTargetProperty && (
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Transférer Propriété ID: {transferTargetProperty.id}</DialogTitle>
              <DialogDescription>Entrez l'adresse du nouveau propriétaire. Action irréversible.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransferSubmit} className="space-y-4 py-2 pb-4">
              <div className="space-y-1">
                <Label htmlFor="newOwnerAddressTransferModal">Nouvelle Adresse Propriétaire</Label>
                <Input id="newOwnerAddressTransferModal" value={newOwnerAddressInput} onChange={(e) => setNewOwnerAddressInput(e.target.value)} placeholder="0x..." disabled={isTransferring}/>
              </div>
              <DialogFooter className="sm:justify-start pt-2">
                <Button type="submit" disabled={isTransferring || !newOwnerAddressInput.trim()}>
                  {isTransferring ? "Transfert en cours..." : "Confirmer Transfert"}
                </Button>
                <DialogClose asChild>
                   <Button type="button" variant="outline" disabled={isTransferring}>Annuler</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}



      {/* Modale pour Afficher les Documents IPFS */}
      <Dialog open={isIpfsDocsDialogOpen} onOpenChange={setIsIpfsDocsDialogOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl"> 
              <DialogHeader>
                  <DialogTitle>Documents de la Propriété (IPFS)</DialogTitle>
                  <DialogDescription>
                      CID du dossier : <code className="text-xs bg-slate-100 dark:bg-slate-700 p-1 rounded font-mono">{currentIpfsFolderCid}</code>
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[60vh] overflow-y-auto">
                  {isLoadingIpfsFolder && <p>Chargement du contenu du dossier IPFS...</p>}
                  {!isLoadingIpfsFolder && ipfsFolderContents.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400">Aucun fichier trouvé dans ce dossier IPFS ou dossier inaccessible.</p>
                  )}
                  {!isLoadingIpfsFolder && ipfsFolderContents.length > 0 && (
                      <ul className="space-y-2">
                          {ipfsFolderContents.map((file, index) => (
                              <li key={file.cid + index} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                                  <span className="truncate" title={file.name}>
                                      {file.type === 'dir' ? '📁' : '📄'} {file.name} 
                                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">({(file.size / 1024).toFixed(2)} KB)</span>
                                  </span>
                                  <Button variant="ghost" size="sm" asChild>
                                      <a 
                                          href={`${IPFS_GATEWAY_URL}${file.cid}`} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          title={`Ouvrir ${file.name} (CID: ${file.cid})`}
                                      >
                                          Ouvrir
                                      </a>
                                  </Button>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsIpfsDocsDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>


      {/* Modale pour Afficher l'Historique */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={(isOpen) => {
          setIsHistoryDialogOpen(isOpen);
          if (!isOpen) { // Si on ferme la modale, réinitialiser
              setHistoryTargetId(null);
              setPropertyHistory([]);
          }
      }}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Historique Propriété ID: {historyTargetId}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                  {isLoadingHistory && <p>Chargement de l'historique...</p>}
                  {!isLoadingHistory && propertyHistory.length > 0 && (
                      <ul className="space-y-1 text-sm">
                          {propertyHistory.map((ownerAddr, index) => (
                              <li key={index} className="font-mono p-1 bg-slate-100 dark:bg-slate-700 rounded text-xs truncate" title={ownerAddr}>
                                  {index + 1}. {ownerAddr}
                              </li>
                          ))}
                      </ul>
                  )}
                  {!isLoadingHistory && propertyHistory.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400">Aucun ancien propriétaire enregistré.</p>
                  )}
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => {
                      setIsHistoryDialogOpen(false);
                      setHistoryTargetId(null);
                      setPropertyHistory([]);
                  }}>Fermer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default App;