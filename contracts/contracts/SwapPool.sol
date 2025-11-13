// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SwapPool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable eutToken;
    uint256 public feeBps;

    struct Pool {
        IERC20 token;
        uint256 rate;
        bool exists;
    }

    mapping(address => Pool) private _pools;
    mapping(address => mapping(address => bool)) private _allowlist;
    mapping(address => uint256) private _allowlistCount;

    event PoolUpdated(address indexed token, uint256 rate);
    event FeeUpdated(uint256 feeBps);
    event AllowlistUpdated(address indexed token, address indexed account, bool allowed);
    event Deposited(address indexed token, address indexed from, uint256 amount);
    event SwapExecuted(
        address indexed trader,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );

    constructor(IERC20 eutToken_, uint256 feeBps_) Ownable(msg.sender) {
        require(address(eutToken_) != address(0), "SwapPool: EUT token required");
        require(feeBps_ <= 10_000, "SwapPool: invalid fee");
        eutToken = eutToken_;
        feeBps = feeBps_;
    }

    function setPool(address token, uint256 rate) external onlyOwner {
        require(token != address(0), "SwapPool: token required");
        require(rate > 0, "SwapPool: rate must be positive");
        _pools[token] = Pool({token: IERC20(token), rate: rate, exists: true});
        emit PoolUpdated(token, rate);
    }

    function setFeeBps(uint256 feeBps_) external onlyOwner {
        require(feeBps_ <= 10_000, "SwapPool: invalid fee");
        feeBps = feeBps_;
        emit FeeUpdated(feeBps_);
    }

    function setAllowlist(address token, address account, bool allowed) external onlyOwner {
        Pool memory pool = _pools[token];
        require(pool.exists, "SwapPool: pool missing");
        require(account != address(0), "SwapPool: account required");

        bool current = _allowlist[token][account];
        if (allowed == current) {
            return;
        }
        _allowlist[token][account] = allowed;
        if (allowed) {
            _allowlistCount[token] += 1;
        } else if (_allowlistCount[token] > 0) {
            _allowlistCount[token] -= 1;
        }
        emit AllowlistUpdated(token, account, allowed);
    }

    function isAllowed(address token, address account) public view returns (bool) {
        if (_allowlistCount[token] == 0) {
            return true;
        }
        return _allowlist[token][account];
    }

    function getPool(address token) external view returns (Pool memory) {
        return _pools[token];
    }

    function deposit(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "SwapPool: amount zero");
        require(token == address(eutToken) || _pools[token].exists, "SwapPool: unsupported token");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(token, msg.sender, amount);
    }

    function swapEutForSpv(address spvToken, uint256 amountIn, address recipient) external returns (uint256) {
        Pool memory pool = _pools[spvToken];
        require(pool.exists, "SwapPool: pool missing");
        require(recipient != address(0), "SwapPool: recipient required");
        require(isAllowed(spvToken, recipient), "SwapPool: recipient not allowed");
        require(amountIn > 0, "SwapPool: amount zero");

        eutToken.safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 feeAmount = (amountIn * feeBps) / 10_000;
        uint256 netAmount = amountIn - feeAmount;
        uint256 amountOut = (netAmount * pool.rate) / 1e18;

        pool.token.safeTransfer(recipient, amountOut);
        emit SwapExecuted(msg.sender, address(eutToken), spvToken, amountIn, amountOut, feeAmount);
        return amountOut;
    }

    function swapSpvForEut(address spvToken, uint256 amountIn, address recipient) external returns (uint256) {
        Pool memory pool = _pools[spvToken];
        require(pool.exists, "SwapPool: pool missing");
        require(recipient != address(0), "SwapPool: recipient required");
        require(isAllowed(spvToken, msg.sender), "SwapPool: sender not allowed");
        require(amountIn > 0, "SwapPool: amount zero");

        pool.token.safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 eutOut = (amountIn * 1e18) / pool.rate;
        uint256 feeAmount = (eutOut * feeBps) / 10_000;
        uint256 netAmount = eutOut - feeAmount;

        eutToken.safeTransfer(recipient, netAmount);
        emit SwapExecuted(msg.sender, spvToken, address(eutToken), amountIn, netAmount, feeAmount);
        return netAmount;
    }
}
