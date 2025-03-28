// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// interface IResearchFundingPlatform {
//     function getResearcher(
//         address _researcher
//     )
//         external
//         view
//         returns (
//             address wallet,
//             bytes32 openCampusId,
//             string memory name,
//             string memory university,
//             string[] memory researchInterests,
//             bool isVerified
//         );
// }

// contract ResearchNFT is ERC721URIStorage, Ownable {
//     using Counters for Counters.Counter;
//     Counters.Counter private tokenCounter;

//     IResearchFundingPlatform public researchPlatform;

//     constructor(
//         address _researchPlatformAddress
//     ) ERC721("ResearchPaperNFT", "RPN") {
//         researchPlatform = IResearchFundingPlatform(_researchPlatformAddress);
//     }

//     function mintResearchNFT(string memory _paperURI) external {
//         // Get researcher details (ignore unused values)
//         (address wallet, , , , , bool isVerified) = researchPlatform
//             .getResearcher(msg.sender);

//         require(wallet != address(0), "You must be a registered researcher.");
//         require(isVerified, "Researcher must be verified to mint NFT.");

//         uint256 newTokenId = tokenCounter.current();
//         _safeMint(msg.sender, newTokenId);
//         _setTokenURI(newTokenId, _paperURI);
//         tokenCounter.increment();
//     }
// }
