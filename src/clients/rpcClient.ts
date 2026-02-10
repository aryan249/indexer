import { ethers } from "ethers";
import { config } from "../config/config";

export const provider = new ethers.JsonRpcProvider(config.RPC_URL);
