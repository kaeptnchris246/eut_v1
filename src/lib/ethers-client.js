let ethersPromise;

const loadEthers = async () => {
  if (!ethersPromise) {
    ethersPromise = import(
      /* @vite-ignore */ "https://esm.sh/ethers@6.13.4?bundle"
    ).then((module) => module?.ethers ?? module);
  }
  return ethersPromise;
};

export const getBrowserProvider = async (provider) => {
  const ethers = await loadEthers();
  return new ethers.BrowserProvider(provider);
};

export const getJsonRpcProvider = async (rpcUrl) => {
  const ethers = await loadEthers();
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const formatEtherValue = async (value) => {
  const ethers = await loadEthers();
  return ethers.formatEther(value);
};

export const formatUnitsValue = async (value, decimals) => {
  const ethers = await loadEthers();
  return ethers.formatUnits(value, decimals);
};

export const parseUnitsValue = async (value, decimals) => {
  const ethers = await loadEthers();
  return ethers.parseUnits(value, decimals);
};

export const createContract = async (address, abi, providerOrSigner) => {
  const ethers = await loadEthers();
  return new ethers.Contract(address, abi, providerOrSigner);
};

export default loadEthers;
