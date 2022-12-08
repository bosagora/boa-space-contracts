import { BigNumber, BigNumberish, Wallet} from "ethers";

export function getTokenIdInfo(tokenId: string): [string, number, number] {
    const ADDRESS_BITS = 160;
    const INDEX_BITS = 56;
    const SUPPLY_BITS = 40;

    const lastNftId = BigNumber.from(tokenId);
    const SUPPLY_MASK = BigNumber.from(1).shl(SUPPLY_BITS).sub(1);
    const INDEX_MASK = BigNumber.from(1).shl(INDEX_BITS).sub(1).xor(SUPPLY_MASK);

    const address = lastNftId.shr(INDEX_BITS + SUPPLY_BITS).toHexString();
    const tokenIndex = lastNftId.and(INDEX_MASK).shr(SUPPLY_BITS).toNumber();
    const maxSupply = lastNftId.and(SUPPLY_MASK).toNumber();

    return [address, tokenIndex, maxSupply];
}
