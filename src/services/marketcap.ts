import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { Request, Response } from "express";
import { API_KEY } from "../config";

const total = 21_000_000;

const bfApi = new BlockFrostAPI({
  projectId: API_KEY as string,
  network: "mainnet",
});

export const totalSupply = (req: Request, res: Response) => {
  res.json(total);
};

export async function getAmountInAddresses(
  blockFrost: BlockFrostAPI,
  token: string,
  addresses: string[]
): Promise<bigint> {
  const amounts = await Promise.all(
    addresses.map(async (addr): Promise<bigint> => {
      const value = addr.startsWith("stake")
        ? await blockFrost.accountsAddressesAssetsAll(addr)
        : await blockFrost.addresses(addr).then((resp) => resp.amount);
      const amount = value
        .filter(({ unit }) => unit === token)
        .reduce((sum, x) => sum + BigInt(x.quantity), 0n);
      return amount;
    })
  );
  return amounts.reduce((sum, x) => sum + x, 0n);
}

export const circulatingSupply = async (req: Request, res: Response) => {
  try {
    const NVL =
      "5b26e685cc5c9ad630bde3e3cd48c694436671f3d25df53777ca60ef4e564c";
    const TREASURY_ADDRESSES = [
      "stake179qxx9fyg59ad4x7vpnksxlkc93nsj5zc2v3hy8up2kangc7qzvzh", // treasury
      "stake179kx2h763naj8nm8uujxe9q0xksnu8t05p5rzgxnmez9nsc8kpzhd", // team
    ];
    const treasury =
      Number(await getAmountInAddresses(bfApi, NVL, TREASURY_ADDRESSES)) / 1e6;
    res.json(total - treasury);
  } catch (e: any) {
    res.status(500).send(e.message || "Something went wrong");
  }
};
