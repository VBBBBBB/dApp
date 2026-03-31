//SPDX-License-Identifier:MIT

pragma solidity 0.8.30;

contract CertVerify{

    struct Cert{

        string cID;

        bytes32 fhash;

    }

    mapping(uint256 => Cert) public Certs;

    function storeCredentials(uint256 sId,string memory cID,bytes32 _fhash) public {

        Certs[sId] = Cert( cID, _fhash);

    }

}




