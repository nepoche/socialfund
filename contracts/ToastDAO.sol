pragma solidity ^0.4.19;

contract owned {
    address public owner;

    function owned()  public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner  public {
        owner = newOwner;
    }
}
/*---------------------------------------------------------------------------------
contract tokenRecipient {
    event receivedEther(address sender, uint amount);
    event receivedTokens(address _from, uint256 _value, address _token, bytes _extraData);

    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public {
        Token t = Token(_token);
        require(t.transferFrom(_from, this, _value));
        receivedTokens(_from, _value, _token, _extraData);
    }

    function () payable  public {
        receivedEther(msg.sender, msg.value);
    }
}
*///---------------------------------------------------------------------------------
interface Token {
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
}
//---------------------------------------------------------------------------------
contract Toast is owned, tokenRecipient {

    // Contract Variables and events
    mapping (address => uint) contributions; // in wei
    string[] tokens;
    uint public proposalPeriod;
    uint public portfolioValue;
    uint public startTime;
    uint public minimumQuorum;
    uint public debatingPeriod;
    int public majorityMargin;
    uint public investmentPeriod;
    Proposal[] public proposals;
    uint public numProposals;
    mapping (address => uint) public memberId;
    Member[] public members;
    mapping (string => uint) public portfolio;
    uint public annualizedROI;

    event ProposalAdded(uint proposalID, address recipient, uint amount, string description);
    event Voted(uint proposalID, bool position, address voter, string justification);
    event ProposalTallied(uint proposalID, int result, uint quorum, bool active);
    event MembershipChanged(address member, bool isMember);
    //event ChangeOfRules(uint newMinimumQuorum, uint newDebatingPeriodInMinutes, int newMajorityMargin);


    // Come back to and fix in accordance with newProposal
    struct Proposal {
        //address recipient;
        //uint amount;
        string token;
        string description;
        uint votingDeadline;
        bool executed;
        bool proposalPassed;
        uint numberOfVotes;
        int currentResult;
        bytes32 proposalHash;
        Vote[] votes;
        mapping (address => bool) voted;
    }

    struct Member {
        address member;
        //uint memberContributions; // in wei
        //string name;
        //uint memberSince;
    }

    struct Vote {
        bool inSupport;
        address voter;
        //string justification;
    }

    // Modifier that allows only shareholders to vote and create new proposals
    modifier onlyMembers {
        require(memberId[msg.sender] != 0);
        _;
    }

    /**
     * Constructor function
     */

     // need anything else on the constructor function?
    function Toast (
        uint minimumQuorumForProposals,
        uint minutesForDebate,
        int marginOfVotesForMajority,
        uint setInvestmentInterval
    )  payable public {
        changeVotingRules(minimumQuorumForProposals, daysForDebate, marginOfVotesForMajority, setInvestmentInterval);
        addMember(0, ""); // It’s necessary to add an empty first member
        addMember(owner, 'founder'); // and let's add the founder, to save a step later
        startTime = now;
        proposalPeriod = 5;
        annualizedROI = 500;
        portffolioValue = 10000000000000000000;
    }

    function contribute() payable external {
        require(msg.value >= 1000000000000000000)
        require(now =< startTime + proposalPeriod * 1 days)
        contributions[msg.sender] = msg.value;
    }

    function getFund() public constant returns (address, uint, uint) {
      return (owner, portfolioValue, annualizedROI);
    }

    /**
     * Add member
     *
     * Make `targetMember` a member named `memberName`
     *
     * @param targetMember ethereum address to be added
     * @param memberName public name for that member
     */

    function addMember(address targetMember) onlyOwner external {
        uint id = memberId[targetMember];
        if (id == 0) {
            memberId[targetMember] = members.length;
            id = members.length++;
        }

        members[id] = Member({member: targetMember});
        portfolioValue = portfolioValue + contributions[targetMember];
        MembershipChanged(targetMember, true);
    }

    function withdrawRefund(address targetMember) external {
        require(memberId[targetMember] == 0);
        uint refund = refunds[msg.sender];
        refunds[msg.sender] = 0;
        msg.sender.transfer(refund);
    }

    /**
     * Remove member
     *
     * @notice Remove membership from `targetMember`
     *
     * @param targetMember ethereum address to be removed
     */
    function removeMember(address targetMember) onlyOwner external {
        require(memberId[targetMember] != 0);

        //ADD IF STATEMENT TO MAKE SURE THEY CAN ONLY LIQUIDATE DURING CERTAIN PERIOD
        for (uint i = memberId[targetMember]; i<members.length-1; i++){
            members[i] = members[i+1];
        }
        portfolioValue = portfolioValue - contributions[targetMember];
        delete members[members.length-1];
        members.length--;
    }

    /**
     * Change voting rules
     *
     * Make so that proposals need to be discussed for at least `minutesForDebate/60` hours,
     * have at least `minimumQuorumForProposals` votes, and have 50% + `marginOfVotesForMajority` votes to be executed
     *
     * @param minimumQuorumForProposals how many members must vote on a proposal for it to be executed
     * @param minutesForDebate the minimum amount of delay between when a proposal is made and when it can be executed
     * @param marginOfVotesForMajority the proposal needs to have 50% plus this number
     */
    function changeVotingRules(
        uint minimumQuorumForProposals,
        uint minutesForDebate,
        int marginOfVotesForMajority,
        uint setInvestmentInterval
    ) onlyOwner external {
        minimumQuorum = 3; //minimumQuorumForProposals;
        debatingPeriod = 5; //DaysForDebate;
        majorityMargin = 1; //marginOfVotesForMajority;
        investmentPeriod = 30;

        //ChangeOfRules(minimumQuorum, debatingPeriodInMinutes, majorityMargin);
    }

    /**
     * Add Proposal
     *
     * Propose to send `weiAmount / 1e18` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     *
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send, in wei
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposal(
        address beneficiary,
        uint weiAmount,
        string jobDescription,
        bytes transactionBytecode
    )
        onlyMembers public
        returns (uint proposalID)
    {
        require(now =< startTime + proposalPeriod * 1 days)
        proposalID = proposals.length++;
        Proposal storage p = proposals[proposalID];
        //p.recipient = beneficiary;
        //p.amount = weiAmount; // V2. distribution
        p.token = tokenName; // Token Name
        p.description = jobDescription; // Description of Token
        p.proposalHash = keccak256(beneficiary, weiAmount, transactionBytecode);
        //p.votingDeadline = now + debatingPeriodInMinutes * 1 minutes;
        p.executed = false;
        p.proposalPassed = false;
        p.numberOfVotes = 0;
        ProposalAdded(proposalID, beneficiary, weiAmount, jobDescription);
        numProposals = proposalID+1;

        return proposalID;
    }

    /**
     * Add proposal in Ether
     *
     * Propose to send `etherAmount` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     * This is a convenience function to use if the amount to be given is in round number of ether units.
     *
     * @param beneficiary who to send the ether to
     * @param etherAmount amount of ether to send
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposalInEther(
        address beneficiary,
        uint etherAmount,
        string jobDescription,
        bytes transactionBytecode
    )
        onlyMembers external
        returns (uint proposalID)
    {
        return newProposal(beneficiary, etherAmount * 1 ether, jobDescription, transactionBytecode);
    }

    /**
     * Check if a proposal code matches
     *
     * @param proposalNumber ID number of the proposal to query
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send
     * @param transactionBytecode bytecode of transaction
     */
    function checkProposalCode(
        uint proposalNumber,
        address beneficiary,
        uint weiAmount,
        bytes transactionBytecode
    )
        constant external
        returns (bool codeChecksOut)
    {
        Proposal storage p = proposals[proposalNumber];
        return p.proposalHash == keccak256(beneficiary, weiAmount, transactionBytecode);
    }

    /**
     * Log a vote for a proposal
     *
     * Vote `supportsProposal? in support of : against` proposal #`proposalNumber`
     *
     * @param proposalNumber number of proposal
     * @param supportsProposal either in favor or against it
     * @param justificationText optional justification text
     */
    function vote(
        uint proposalNumber,
        bool supportsProposal,
        string justificationText
    )
        onlyMembers external
        returns (uint voteID)
    {
        Proposal storage p = proposals[proposalNumber];         // Get the proposal
        require(!p.voted[msg.sender]);         // If has already voted, cancel
        p.voted[msg.sender] = true;                     // Set this voter as having voted
        p.numberOfVotes++;                              // Increase the number of votes
        if (supportsProposal) {                         // If they support the proposal
            p.currentResult++;                          // Increase score
        } else {                                        // If they don't
            p.currentResult--;                          // Decrease the score
        }

        // Create a log of this event
        Voted(proposalNumber,  supportsProposal, msg.sender, justificationText);
        return p.numberOfVotes;
    }

    /**
     * Finish vote
     *
     * Count the votes proposal #`proposalNumber` and execute it if approved
     *
     * @param proposalNumber proposal number
     * @param transactionBytecode optional: if the transaction contained a bytecode, you need to send it
     */
    function executeProposal(uint proposalNumber, bytes transactionBytecode) external {
        Proposal storage p = proposals[proposalNumber];

        require(now > p.votingDeadline                                            // If it is past the voting deadline
            && !p.executed                                                         // and it has not already been executed
            && p.proposalHash == keccak256(p.recipient, p.amount, transactionBytecode)  // and the supplied code matches the proposal
            && p.numberOfVotes >= minimumQuorum);                                  // and a minimum quorum has been reached...

        // ...then execute result

        if (p.currentResult > majorityMargin) {
            // Proposal passed; execute the transaction

            p.executed = true; // Avoid recursive calling
            require(p.recipient.call.value(p.amount)(transactionBytecode));

            p.proposalPassed = true;
        } else {
            // Proposal failed
            p.proposalPassed = false;
        }

        // Fire Events
        ProposalTallied(proposalNumber, p.currentResult, p.numberOfVotes, p.proposalPassed);
    }

    function executeTrade(string token) onlyOwner external {
      require(now => startTime + proposalPeriod * 1 days + debatingPeriod * 1 days)
      require(portfolio[token] != 0)

      uint trade = portfolio[token];
      portfolio[token] = 0;
      this.transfer(trade);

      // add trades

    }

    // function to exit token trades and recollect portfolioValue
    function exitTrade(string token) onlyOwner external {

    }

    function receiveFunds() external {
      require(now => startTime + proposalPeriod * 1 days + debatingPeriod * 1 days + investmentPeriod * 1 days)
      require(memberId[targetMember] != 0);

      uint percentage = 100 * (contributions[msg.sender]/portfolioValue);
      uint percentageFinal = percentage/100;
      //uint refund = refunds[msg.sender];
      contributions[msg.sender] = 0;
      msg.sender.transfer(portfolioValue*percentageFinal);


    }
}
