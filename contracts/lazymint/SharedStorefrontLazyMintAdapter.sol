// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @author emo.eth
 * @title SharedStorefrontLazyMintAdapter
 * @notice SharedStorefrontLazymintAdapter is a stub of an ERC1155 token,
 *         which acts as a safe proxy for lazily minting tokens from the
 *         the underlying Shared Storefront.
 *         The lazy minting functionality of the original Shared Storefront
 *         was built with the assumption that every user would have their own
 *         individual Wyvern-style proxy, which makes an exchange with
 *         a global proxy like Seaport unsafe to add as a shared proxy.
 *         This adapter contract performs the necessary check that lazily
 *         minted tokens are being spent from their creators' address, relying
 *         on the invariant that Seaport will never transfer tokens from an
 *         account that has not signed a valid order.

 SharedStorefrontLazymintAdapter는 ERC1155 토큰의 스텁으로, 기본 공유 스토어 프론트에서 토큰을 느리게 조폐하기 위한 안전한 프록시 역할을 합니다.
 원래 공유 스토어 프론트의 느린 조폐 기능은 모든 사용자가 자신만의 와이번 스타일 프록시를 가질 것이라는 가정 하에 구축되었으며,
 이는 시포트와 같은 글로벌 프록시와의 교환을 공유 프록시로 추가하는 것을 안전하지 않게 만든다.
 이 어댑터 계약은 시포트가 유효한 주문에 서명하지 않은 계정에서 토큰을 전송하지 않을 것이라는 불변성에 의존하여 제작자의 주소에서 느슨하게 주조된 토큰이 지출되고 있는지 필요한 점검을 수행합니다.

 */
contract SharedStorefrontLazyMintAdapter {
    IERC1155 immutable ssfToken;
    address private constant SEAPORT =
    0x70E98Ae72a7CBaE517a3944E07229b3D36B51d5d;
    address private constant CONDUIT =
    0xCb367fE0E4c775c8488347Ce61A43c6b49a4ed21;

    error InsufficientBalance();
    error UnauthorizedCaller();

    modifier onlySeaportOrConduit() {
        if (msg.sender != CONDUIT && msg.sender != SEAPORT) {
            revert UnauthorizedCaller();
        }
        _;
    }

    modifier onlyCreatorLazyMint(
        address from,
        uint256 tokenId,
        uint256 amount
    ) {
        // get balance of spender - this will return current balance
        // plus remaining supply if spender is the creator
        // (or this contract itself - which should never be possible,
        // as Seaport will only spend from accts that have signed a valid order)
        uint256 fromBalance = ssfToken.balanceOf(from, tokenId);

        // if insufficient balance, revert
        if (fromBalance < amount) {
            revert InsufficientBalance();
        }
        _;
    }

    constructor(address tokenAddress) {
        ssfToken = IERC1155(tokenAddress);
    }

    /**
     * @notice stub method that performs two checks before calling real SSF safeTransferFrom
     *   1. check that the caller is a valid proxy (Seaport or OpenSea conduit)
     *   2. check that the token spender owns enough tokens, or is the creator of
     *      the token and not all tokens have been minted yet
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory
    ) public onlySeaportOrConduit onlyCreatorLazyMint(from, tokenId, amount) {
        // Seaport 1.1 always calls safeTransferFrom with empty data
        ssfToken.safeTransferFrom(from, to, tokenId, amount, "");
    }

    /**
     * @notice pass-through balanceOf method to the SSF for backwards-compatibility with seaport-js
     * @param owner address to check balance of
     * @param tokenId id to check balance of
     * @return uint256 balance of tokenId for owner
     */
    function balanceOf(address owner, uint256 tokenId)
    public
    view
    returns (uint256)
    {
        return ssfToken.balanceOf(owner, tokenId);
    }

    /**
     * @notice stub isApprovedForAll method for backwards-compatibility with seaport-js
     * @param operator address to check approval of
     * @return bool if operator is Conduit or Seaport
     */
    function isApprovedForAll(address, address operator)
    public
    pure
    returns (bool)
    {
        return operator == CONDUIT || operator == SEAPORT;
    }
}
