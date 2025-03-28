// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("ResearchPaperNFT", function () {
//     let owner, researcher, nonResearcher;
//     let researchPlatform, researchNFT;

//     beforeEach(async function () {
//         // Get signers
//         [owner, researcher, nonResearcher] = await ethers.getSigners();

//         // Deploy ResearchFundingPlatform
//         const ResearchFundingPlatform = await ethers.getContractFactory("ResearchFundingPlatform");
//         researchPlatform = await ResearchFundingPlatform.deploy();
//         await researchPlatform.waitForDeployment();

//         // Deploy ResearchPaperNFT
//         const ResearchPaperNFT = await ethers.getContractFactory("ResearchPaperNFT");
//         researchNFT = await ResearchPaperNFT.deploy(await researchPlatform.getAddress());
//         await researchNFT.waitForDeployment();
//     });

//     it("Should register and verify a researcher", async function () {
//         // Researcher registers
//         await researchPlatform.connect(researcher).registerResearcher(
//             ethers.keccak256(ethers.toUtf8Bytes("12345")),
//             "Alice Researcher",
//             "Blockchain University",
//             ["AI", "Blockchain"]
//         );

//         // Verify researcher (only owner can do this)
//         await researchPlatform.connect(owner).verifyResearcher(researcher.address);

//         // Fetch researcher details
//         const registeredResearcher = await researchPlatform.researchers(researcher.address);
//         expect(registeredResearcher.isVerified).to.equal(true);
//     });

//     it("Should allow only verified researchers to mint NFT", async function () {
//         const paperLink = "https://example.com/research-paper-1";

//         // Researcher registers but is NOT verified
//         await researchPlatform.connect(researcher).registerResearcher(
//             ethers.keccak256(ethers.toUtf8Bytes("12345")),
//             "Alice Researcher",
//             "Blockchain University",
//             ["AI", "Blockchain"]
//         );

//         // Attempt to mint NFT before verification (should fail)
//         await expect(researchNFT.connect(researcher).mintResearchNFT(paperLink)).to.be.revertedWith(
//             "Researcher is not verified"
//         );

//         // Verify researcher
//         await researchPlatform.connect(owner).verifyResearcher(researcher.address);

//         // Now researcher can mint an NFT
//         await expect(researchNFT.connect(researcher).mintResearchNFT(paperLink))
//             .to.emit(researchNFT, "ResearchNFTMinted")
//             .withArgs(researcher.address, 1, paperLink);

//         // Check NFT ownership
//         expect(await researchNFT.ownerOf(1)).to.equal(researcher.address);
//     });

//     it("Should return the correct research paper link", async function () {
//         const paperLink = "https://example.com/research-paper-2";

//         // Researcher registers and is verified
//         await researchPlatform.connect(researcher).registerResearcher(
//             ethers.keccak256(ethers.toUtf8Bytes("12345")),
//             "Alice Researcher",
//             "Blockchain University",
//             ["AI", "Blockchain"]
//         );
//         await researchPlatform.connect(owner).verifyResearcher(researcher.address);

//         // Researcher mints NFT
//         await researchNFT.connect(researcher).mintResearchNFT(paperLink);

//         // Fetch paper link
//         const storedLink = await researchNFT.getResearchPaperLink(1);
//         expect(storedLink).to.equal(paperLink);
//     });

//     it("Should list NFTs owned by a researcher", async function () {
//         const paperLink1 = "https://example.com/research-paper-1";
//         const paperLink2 = "https://example.com/research-paper-2";

//         // Researcher registers and is verified
//         await researchPlatform.connect(researcher).registerResearcher(
//             ethers.keccak256(ethers.toUtf8Bytes("12345")),
//             "Alice Researcher",
//             "Blockchain University",
//             ["AI", "Blockchain"]
//         );
//         await researchPlatform.connect(owner).verifyResearcher(researcher.address);

//         // Researcher mints two NFTs
//         await researchNFT.connect(researcher).mintResearchNFT(paperLink1);
//         await researchNFT.connect(researcher).mintResearchNFT(paperLink2);

//         // Fetch researcher's NFTs
//         const nftList = await researchNFT.getResearcherNFTs(researcher.address);
//         expect(nftList.length).to.equal(2);
//         expect(nftList[0]).to.equal(1);
//         expect(nftList[1]).to.equal(2);
//     });

//     it("Should prevent non-researchers from minting NFTs", async function () {
//         await expect(researchNFT.connect(nonResearcher).mintResearchNFT("https://example.com/paper")).to.be.revertedWith(
//             "Researcher not registered"
//         );
//     });
// });
