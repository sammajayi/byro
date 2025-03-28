
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ResearchFundingPlatform is Ownable, ReentrancyGuard {
    // Structs
    struct Researcher {
        address walletAddress;
        bytes32 openCampusId;
        string name;
        string university;
        string[] researchInterests;
        uint256 reputation;
        bool isVerified;
    }

    struct ResearchProposal {
        uint256 id;
        address researcher;
        string title;
        string description;
        uint256 fundingAmount;
        uint256 totalMilestones;
        uint256 currentMilestone;
        ProposalStatus status;
        address[] funders;
        mapping(uint256 => Milestone) milestones;
    }

    struct Milestone {
        string description;
        uint256 fundAmount;
        bool isCompleted;
        uint256 deadline;
    }

    // Enums
    enum ProposalStatus {
        Pending,
        Approved,
        Funded,
        InProgress,
        Completed,
        Rejected
    }

    // Mappings
    mapping(address => Researcher) public researchers;
    mapping(uint256 => ResearchProposal) public proposals;
    mapping(address => uint256[]) public researcherProposals;

    // Events
    event ResearcherRegistered(
        address indexed researcher,
        bytes32 openCampusId
    );
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed researcher
    );
    event ProposalFunded(
        uint256 indexed proposalId,
        address indexed funder,
        uint256 amount
    );
    event MilestoneSubmitted(
        uint256 indexed proposalId,
        uint256 milestoneNumber
    );
    event MilestoneApproved(
        uint256 indexed proposalId,
        uint256 milestoneNumber
    );

    // State Variables
    uint256 public proposalCounter;
    uint256 public constant MIN_FUNDING_AMOUNT = 0.1 ether;
    uint256 public constant MAX_MILESTONES = 5;

    // Constructor with msg.sender as the initial owner
    constructor() Ownable() {
        // This is where Ownable constructor is called with msg.sender as the owner
    }

    // Researcher Registration
    function registerResearcher(
        bytes32 _openCampusId,
        string memory _name,
        string memory _university,
        string[] memory _researchInterests
    ) external {
        require(
            researchers[msg.sender].walletAddress == address(0),
            "Researcher already registered"
        );

        Researcher storage newResearcher = researchers[msg.sender];
        newResearcher.walletAddress = msg.sender;
        newResearcher.openCampusId = _openCampusId;
        newResearcher.name = _name;
        newResearcher.university = _university;
        newResearcher.researchInterests = _researchInterests;
        newResearcher.reputation = 0;
        newResearcher.isVerified = false;

        emit ResearcherRegistered(msg.sender, _openCampusId);
    }

    // Create Research Proposal
    function createResearchProposal(
        string memory _title,
        string memory _description,
        uint256 _fundingAmount,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneFunds,
        uint256[] memory _milestoneDeadlines
    ) external {
        require(
            researchers[msg.sender].walletAddress != address(0),
            "Researcher not registered"
        );
        require(
            _milestoneDescriptions.length <= MAX_MILESTONES,
            "Too many milestones"
        );
        require(_fundingAmount >= MIN_FUNDING_AMOUNT, "Funding amount too low");

        uint256 proposalId = proposalCounter++;
        ResearchProposal storage newProposal = proposals[proposalId];

        newProposal.id = proposalId;
        newProposal.researcher = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.fundingAmount = _fundingAmount;
        newProposal.status = ProposalStatus.Pending;
        newProposal.totalMilestones = _milestoneDescriptions.length;

        // Create Milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            newProposal.milestones[i] = Milestone({
                description: _milestoneDescriptions[i],
                fundAmount: _milestoneFunds[i],
                isCompleted: false,
                deadline: _milestoneDeadlines[i]
            });
        }

        researcherProposals[msg.sender].push(proposalId);
        emit ProposalCreated(proposalId, msg.sender);
    }

    // Fund a Research Proposal
    function fundProposal(uint256 _proposalId) external payable {
        ResearchProposal storage proposal = proposals[_proposalId];
        require(
            proposal.status == ProposalStatus.Pending,
            "Proposal not available for funding"
        );
        require(msg.value > 0, "Funding amount must be greater than 0");

        proposal.funders.push(msg.sender);

        if (address(this).balance >= proposal.fundingAmount) {
            proposal.status = ProposalStatus.Funded;
        }

        emit ProposalFunded(_proposalId, msg.sender, msg.value);
    }

    // Submit Milestone
    function submitMilestone(
        uint256 _proposalId,
        uint256 _milestoneNumber
    ) external {
        ResearchProposal storage proposal = proposals[_proposalId];
        require(
            proposal.researcher == msg.sender,
            "Only researcher can submit milestone"
        );
        require(
            _milestoneNumber < proposal.totalMilestones,
            "Invalid milestone"
        );

        Milestone storage milestone = proposal.milestones[_milestoneNumber];
        require(!milestone.isCompleted, "Milestone already completed");
        require(
            block.timestamp <= milestone.deadline,
            "Milestone deadline passed"
        );

        milestone.isCompleted = true;
        proposal.currentMilestone++;

        if (proposal.currentMilestone == proposal.totalMilestones) {
            proposal.status = ProposalStatus.Completed;
        }

        // Transfer milestone funds
        payable(msg.sender).transfer(milestone.fundAmount);

        emit MilestoneSubmitted(_proposalId, _milestoneNumber);
        emit MilestoneApproved(_proposalId, _milestoneNumber);
    }

    // Get Researcher Proposals
    function getResearcherProposals(
        address _researcher
    ) external view returns (uint256[] memory) {
        return researcherProposals[_researcher];
    }

    // Verify Researcher (can be done by university or platform admin)
    function verifyResearcher(address _researcher) external onlyOwner {
        Researcher storage researcher = researchers[_researcher];
        researcher.isVerified = true;
    }

    // Withdraw funds (admin function)
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fallback function to receive funds
    receive() external payable {}
}
