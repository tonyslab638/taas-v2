// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaaSProductBirthV2 {

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address issuer;
        bytes32 hash;
    }

    mapping(string => Product) private products;
    mapping(string => bool) public exists;

    address public admin;
    mapping(address => bool) public approvedIssuers;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyIssuer() {
        require(approvedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    // Admin approves a brand wallet
    function approveIssuer(address issuer) external onlyAdmin {
        approvedIssuers[issuer] = true;
    }

    function revokeIssuer(address issuer) external onlyAdmin {
        approvedIssuers[issuer] = false;
    }

    // Only approved brands can mint
    function birthProduct(
        string memory gpid,
        string memory brand,
        string memory model,
        string memory category,
        string memory factory,
        string memory batch,
        bytes32 hash
    ) public onlyIssuer {
        require(!exists[gpid], "Already exists");

        products[gpid] = Product({
            gpid: gpid,
            brand: brand,
            model: model,
            category: category,
            factory: factory,
            batch: batch,
            bornAt: block.timestamp,
            issuer: msg.sender,
            hash: hash
        });

        exists[gpid] = true;
    }

    function getCore(string memory gpid) public view returns (
        string memory,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        require(exists[gpid], "Not found");
        Product memory p = products[gpid];
        return (p.gpid, p.brand, p.model, p.category, p.factory, p.batch);
    }

    function getMeta(string memory gpid) public view returns (
        uint256,
        address,
        bytes32
    ) {
        require(exists[gpid], "Not found");
        Product memory p = products[gpid];
        return (p.bornAt, p.issuer, p.hash);
    }
}
