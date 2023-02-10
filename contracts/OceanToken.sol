//SPDX-License-Identifier:MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract OceanToken is ERC20, ERC20Capped, ERC20Burnable {
    address payable public owner;
    uint256 public blockReward;

    constructor(
        uint256 cap,
        uint256 reward
    ) ERC20("OCEAN", "OTC") ERC20Capped(cap * (10 ** decimals())) {
        owner = payable(msg.sender);
        _mint(msg.sender, 1000000 * (10 ** decimals()));
        blockReward = reward * (10 ** decimals());
    }

    //compile was not getting which mint function to call like from erc20 or erc20capped both the libraries have the _mint function
    // we need to copy paste the mint function form the capped erc20 contract
    function _mint(
        address account,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Capped) {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "ERC20Capped: cap exceeded"
        );
        super._mint(account, amount);
    }

    //mint miner reward
    function _mintMinerReward() internal {
        //account of the node who is including the block to blockchain
        _mint(block.coinbase, blockReward);
    }

    //before we send reward we need to check the address of the block.coinbase and verify and restrict the reward only one time on in infinite loop
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (
            from != address(0) &&
            to != block.coinbase &&
            block.coinbase != address(0)
        ) {
            _mintMinerReward();
        }
        super._beforeTokenTransfer(from, to, value);
    }

    //recreate the fucntion set block reward
    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * (10 ** decimals());
    }

    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only only owner can call this function ");
        _;
    }
}
