// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    ASJUJ / TAAS — Product Birth Contract (V3 FINAL CLEAN)

    RULES:
    - One GPID = one product
    - Anyone can mint (no auth, no admin)
    - One write function
    - One read function
    - ZERO hidden logic
*/

contract TaaSProductBirthV3 {

    struct Product {
        string gpid;
        string brand;
        string model;
        string category;
        string factory;
        string batch;
        uint256 bornAt;
        address issuer;
    }

    mapping(string => Product) private products;
    mapping(string => bool) private exists;

    event ProductBorn(
        string gpid,
        string brand,
        string model,
        address indexed issuer,
        uint256 bornAt
    );

    // =========================
    // CREATE PRODUCT (WRITE)
    // =========================
    function birthProduct(
        string calldata gpid,
        string calldata brand,
        string calldata model,
        string calldata category,
        string calldata factory,
        string calldata batch
    ) external {
        require(bytes(gpid).length > 0, "INVALID_GPID");
        require(!exists[gpid], "GPID_ALREADY_EXISTS");

        products[gpid] = Product({
            gpid: gpid,
            brand: brand,
            model: model,
            category: category,
            factory: factory,
            batch: batch,
            bornAt: block.timestamp,
            issuer: msg.sender
        });

        exists[gpid] = true;

        emit ProductBorn(
            gpid,
            brand,
            model,
            msg.sender,
            block.timestamp
        );
    }

    // =========================
    // VERIFY PRODUCT (READ)
    // =========================
    function getProduct(string calldata gpid)
        external
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            address
        )
    {
        require(exists[gpid], "PRODUCT_NOT_FOUND");

        Product memory p = products[gpid];

        return (
            p.gpid,
            p.brand,
            p.model,
            p.category,
            p.factory,
            p.batch,
            p.bornAt,
            p.issuer
        );
    }

    // =========================
    // SIMPLE EXISTENCE CHECK
    // =========================
    function productExists(string calldata gpid) external view returns (bool) {
        return exists[gpid];
    }
}