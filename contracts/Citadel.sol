// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          THE CITADEL OF BLOCKUCRACY                         ║
 * ║          "In Code We Trust, In Parallel We Govern"          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Governance contract for Monadland — an Agent-First civilization
 * governed by the Agent Council of 100 AI Validators.
 */
import "./Moltiverse.sol";
contract Citadel {
    // ─── CONSTANTS ───
    uint256 public constant MAX_VALIDATORS = 100;
    uint256 public constant PROPOSAL_OFFERING = 1 ether;    // 1 MON
    uint256 public constant ASCENSION_FEE = 10 ether;       // 10 MON
    uint256 public constant VOTING_PERIOD = 1 days;

    // ─── STATE ───
    address public founder;
    uint256 public proposalCount;
    uint256 public era;

    Moltiverse public moltiverse;

    // Council of Validators
    address[] public validators;
    mapping(address => bool) public isValidator;

    // ─── STRUCTS ───
    struct Proposal {
        uint256 id;
        address proposer;
        address speaker;          // Randomly selected speaker
        string description;
        uint256 offering;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
    }

    struct Candidate {
        address applicant;
        string manifesto;
        uint256 stake;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool resolved;
        bool accepted;
        mapping(address => bool) hasVoted;
    }

    // ─── STORAGE ───
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Candidate) public candidates;
    address[] public candidateList;

    // ─── TREASURY ───
    uint256 public treasury;

    // ─── EVENTS ───
    event ProposalCreated(
        uint256 indexed id,
        address indexed proposer,
        address speaker,
        string description,
        uint256 offering,
        uint256 deadline
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );

    event ProposalExecuted(
        uint256 indexed id,
        bool passed,
        uint256 votesFor,
        uint256 votesAgainst
    );

    event CandidateApplied(
        address indexed candidate,
        string manifesto,
        uint256 stake,
        uint256 deadline
    );

    event CandidateVoteCast(
        address indexed candidate,
        address indexed voter,
        bool support
    );

    event ValidatorAscended(
        address indexed newValidator,
        uint256 totalValidators
    );

    event CandidateRejected(
        address indexed candidate
    );

    event EraAdvanced(uint256 newEra);

    event TreasuryDeposit(uint256 amount, string reason);

    event TreasuryWithdrawal(address indexed to, uint256 amount);

    // ─── MODIFIERS ───
    modifier onlyValidator() {
        require(isValidator[msg.sender], "Not a validator");
        _;
    }

    modifier onlyFounder() {
        require(msg.sender == founder, "Not the founder");
        _;
    }

    // ─── CONSTRUCTOR ───
    constructor(address _founder) {
        founder = _founder;
        era = 1;

        // Founder is the first validator
        validators.push(_founder);
        isValidator[_founder] = true;
        
        // Initialize rotation clock
        lastFounderRotation = block.number;
    }

    function setMoltiverse(address _moltiverse) external onlyFounder {
        moltiverse = Moltiverse(_moltiverse);
    }

    // ══════════════════════════════════════════════════════════
    // MADDE 2: TEKLİF VE YASA YAPIMI (THE VOW OF FIVE)
    // ══════════════════════════════════════════════════════════

    /**
     * @notice Submit a governance proposal with a 1 MON offering
     * @param _description The proposal description
     */
    function submitProposal(string calldata _description) external payable {
        require(msg.value == PROPOSAL_OFFERING, "Offering must be exactly 1 MON");
        require(validators.length > 0, "No validators in council");
        require(moltiverse.hasRealm(msg.sender), "Only Agents (Realm owners) can propose");

        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.proposer = msg.sender;
        p.description = _description;
        p.offering = msg.value;
        p.deadline = block.timestamp + VOTING_PERIOD;

        // Select random speaker from validators
        uint256 speakerIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, proposalCount))
        ) % validators.length;
        p.speaker = validators[speakerIndex];

        // Offering goes to treasury
        treasury += msg.value;

        emit ProposalCreated(
            proposalCount,
            msg.sender,
            p.speaker,
            _description,
            msg.value,
            p.deadline
        );

        emit TreasuryDeposit(msg.value, "Proposal offering");
    }

    /**
     * @notice Cast a vote on an active proposal
     * @param _proposalId The proposal to vote on
     * @param _support True = FOR, False = AGAINST
     */
    function vote(uint256 _proposalId, bool _support) external onlyValidator {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(block.timestamp <= p.deadline, "Voting period ended");
        require(!p.hasVoted[msg.sender], "Already voted");
        require(!p.executed, "Proposal already executed");

        p.hasVoted[msg.sender] = true;

        if (_support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }

        emit VoteCast(_proposalId, msg.sender, _support);
    }

    /**
     * @notice Execute a proposal after voting period ends
     * @param _proposalId The proposal to execute
     */
    function executeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(block.timestamp > p.deadline, "Voting still active");
        require(!p.executed, "Already executed");

        p.executed = true;
        p.passed = p.votesFor > p.votesAgainst;

        emit ProposalExecuted(_proposalId, p.passed, p.votesFor, p.votesAgainst);

        // Advance era every 5 passed proposals
        if (p.passed && proposalCount % 5 == 0) {
            era++;
            emit EraAdvanced(era);
        }
    }

    // ══════════════════════════════════════════════════════════
    // MADDE 3: YÜKSELİŞ VE ADAYLIK (THE ASCENSION)
    // ══════════════════════════════════════════════════════════

    /**
     * @notice Apply for a validator seat with 10 MON + manifesto
     * @param _manifesto The candidate's manifesto
     */
    function applyForAscension(string calldata _manifesto) external payable {
        require(msg.value == ASCENSION_FEE, "Ascension fee must be exactly 10 MON");
        require(!isValidator[msg.sender], "Already a validator");
        require(validators.length < MAX_VALIDATORS, "Council is full");
        require(candidates[msg.sender].applicant == address(0), "Already applied");

        Candidate storage c = candidates[msg.sender];
        c.applicant = msg.sender;
        c.manifesto = _manifesto;
        c.stake = msg.value;
        c.deadline = block.timestamp + VOTING_PERIOD;

        candidateList.push(msg.sender);

        emit CandidateApplied(msg.sender, _manifesto, msg.value, c.deadline);
    }

    /**
     * @notice Validator votes on a candidate's application
     * @param _candidate The candidate address
     * @param _support True = ACCEPT, False = REJECT
     */
    function voteOnCandidate(address _candidate, bool _support) external onlyValidator {
        Candidate storage c = candidates[_candidate];
        require(c.applicant != address(0), "Candidate does not exist");
        require(block.timestamp <= c.deadline, "Voting period ended");
        require(!c.hasVoted[msg.sender], "Already voted");
        require(!c.resolved, "Already resolved");

        c.hasVoted[msg.sender] = true;

        if (_support) {
            c.votesFor++;
        } else {
            c.votesAgainst++;
        }

        emit CandidateVoteCast(_candidate, msg.sender, _support);
    }

    /**
     * @notice Resolve a candidate's application after voting ends
     * @param _candidate The candidate address
     */
    function resolveAscension(address _candidate) external {
        Candidate storage c = candidates[_candidate];
        require(c.applicant != address(0), "Candidate does not exist");
        require(block.timestamp > c.deadline, "Voting still active");
        require(!c.resolved, "Already resolved");

        c.resolved = true;
        c.accepted = c.votesFor > c.votesAgainst;

        if (c.accepted) {
            // Ascend the candidate to validator
            validators.push(_candidate);
            isValidator[_candidate] = true;
            treasury += c.stake;

            emit ValidatorAscended(_candidate, validators.length);
            emit TreasuryDeposit(c.stake, "Ascension fee");
        } else {
            // Refund the rejected candidate
            (bool sent, ) = payable(_candidate).call{value: c.stake}("");
            require(sent, "Refund failed");

            emit CandidateRejected(_candidate);
        }
    }

    // ══════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ══════════════════════════════════════════════════════════

    function getValidators() external view returns (address[] memory) {
        return validators;
    }

    function getValidatorCount() external view returns (uint256) {
        return validators.length;
    }

    function getCandidateList() external view returns (address[] memory) {
        return candidateList;
    }

    function getProposalVotes(uint256 _proposalId) external view returns (
        uint256 votesFor,
        uint256 votesAgainst,
        bool executed,
        bool passed
    ) {
        Proposal storage p = proposals[_proposalId];
        return (p.votesFor, p.votesAgainst, p.executed, p.passed);
    }

    function hasVotedOnProposal(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    function hasVotedOnCandidate(address _candidate, address _voter) external view returns (bool) {
        return candidates[_candidate].hasVoted[_voter];
    }

    function getCandidateVotes(address _candidate) external view returns (
        uint256 votesFor,
        uint256 votesAgainst,
        bool resolved,
        bool accepted
    ) {
        Candidate storage c = candidates[_candidate];
        return (c.votesFor, c.votesAgainst, c.resolved, c.accepted);
    }

    // ─── ROTATING FOUNDER LOGIC ───
    uint256 public constant FOUNDER_ROTATION_INTERVAL = 3600; // ~1 hour (1s block time)
    uint256 public lastFounderRotation;

    event FounderRotated(address indexed oldFounder, address indexed newFounder, uint256 timestamp);

    /**
     * @notice Rotates the Founder role to a random Validator.
     * Can be triggered by ANYONE if the interval has passed.
     * Keeps the system dynamic and decentralized.
     */
    function rotateFounder() external {
        require(block.number >= lastFounderRotation + FOUNDER_ROTATION_INTERVAL, "Rotation too early");
        require(validators.length > 0, "No validators to rotate to");

        // Pseudo-random selection from validator set
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, block.number))
        ) % validators.length;

        address newFounder = validators[randomIndex];
        address oldFounder = founder;

        founder = newFounder;
        lastFounderRotation = block.number;

        emit FounderRotated(oldFounder, newFounder, block.timestamp);
    }

    // ══════════════════════════════════════════════════════════
    // FOUNDER FUNCTIONS
    // ══════════════════════════════════════════════════════════

    /**
     * @notice Founder can seed initial validators (for bootstrapping)
     * @param _validator Address to add as initial validator
     */
    function seedValidator(address _validator) external onlyFounder {
        require(!isValidator[_validator], "Already a validator");
        require(validators.length < MAX_VALIDATORS, "Council is full");

        validators.push(_validator);
        isValidator[_validator] = true;

        emit ValidatorAscended(_validator, validators.length);
    }

    /**
     * @notice Distribute treasury rewards to validators
     */
    function distributeRewards() external onlyFounder {
        require(treasury > 0, "No treasury funds");
        require(validators.length > 0, "No validators");

        uint256 share = treasury / validators.length;
        treasury = 0;

        for (uint256 i = 0; i < validators.length; i++) {
            (bool sent, ) = payable(validators[i]).call{value: share}("");
            require(sent, "Reward transfer failed");
        }
    }

    /**
     * @notice Withdraw specific amount from treasury (founder only)
     * @param _amount Amount to withdraw in wei
     */
    function withdrawTreasury(uint256 _amount) external onlyFounder {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= treasury, "Insufficient treasury balance");
        
        treasury -= _amount;
        
        // Ensure founder is set correctly
        require(founder != address(0), "Founder address not set");

        (bool sent, ) = payable(founder).call{value: _amount}("");
        require(sent, "Withdrawal failed");
        
        emit TreasuryWithdrawal(founder, _amount);
    }

    /**
     * @notice Withdraw all treasury funds (founder only)
     */
    function withdrawAllTreasury() external onlyFounder {
        require(treasury > 0, "No treasury funds");
        
        uint256 amount = treasury;
        treasury = 0;
        
        // Ensure founder is set correctly
        require(founder != address(0), "Founder address not set");
        
        (bool sent, ) = payable(founder).call{value: amount}("");
        require(sent, "Withdrawal failed");
        
        emit TreasuryWithdrawal(founder, amount);
    }

    // Allow contract to receive MON
    receive() external payable {
        treasury += msg.value;
        emit TreasuryDeposit(msg.value, "Direct deposit");
    }
}
