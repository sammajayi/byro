// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

contract EventNFT is ERC1155, IERC1155Receiver, ReentrancyGuard {
    uint256 private currentTokenId;
    uint256 private currentEventId;
    address private owner;

    struct Event {
        uint256 tokenId;
        uint256 capacity;
        uint256 registered;
        string baseURI;
        string name;
        string location;
        uint256 date; // UNIX timestamp
    }

    mapping(uint256 => Event) private events;
    mapping(uint256 => mapping(address => bool)) public hasConfirmedAttendance;
    mapping(uint256 => mapping(address => uint256)) public attendeeTokenIds;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    event EventCreated(
        uint256 indexed eventId,
        uint256 indexed tokenId,
        string name,
        string location,
        uint256 date,
        uint256 capacity
    );

    event TicketMinted(
        address indexed attendee,
        uint256 indexed eventId,
        uint256 indexed tokenId,
        uint256 timestamp
    );

    constructor(string memory initialBaseURI) ERC1155(initialBaseURI) {
        owner = msg.sender;
    }

    function createEvent(
        string memory eventBaseURI,
        string memory name,
        string memory location,
        uint256 date,
        uint256 capacity
    ) external onlyOwner returns (uint256) {
        require(bytes(name).length > 0, "Empty name");
        require(bytes(location).length > 0, "Empty location");
        require(date > block.timestamp, "Event must be in future");
        require(capacity > 0, "Capacity must be greater than 0");

        uint256 newTokenId = currentTokenId++;
        currentEventId++;

        events[currentEventId] = Event({
            tokenId: newTokenId,
            capacity: capacity,
            registered: 0,
            baseURI: eventBaseURI,
            name: name,
            location: location,
            date: date
        });

        emit EventCreated(
            currentEventId,
            newTokenId,
            name,
            location,
            date,
            capacity
        );

        return currentEventId;
    }

    function confirmAttendance(uint256 eventId) external nonReentrant {
        require(eventId > 0 && eventId <= currentEventId, "Invalid eventId");
        Event storage _event = events[eventId];

        require(
            !hasConfirmedAttendance[eventId][msg.sender],
            "Already confirmed attendance"
        );
        require(_event.registered < _event.capacity, "Event full");
        require(block.timestamp < _event.date, "Event must be in future");

        _event.registered++;
        hasConfirmedAttendance[eventId][msg.sender] = true;

        uint256 tokenId = _event.tokenId;
        _mint(msg.sender, tokenId, 1, "");
        attendeeTokenIds[eventId][msg.sender] = tokenId;

        emit TicketMinted(msg.sender, eventId, tokenId, block.timestamp);
    }

    function getEventDetails(
        uint256 eventId
    )
        external
        view
        returns (
            uint256 tokenId,
            string memory name,
            string memory location,
            uint256 date,
            uint256 capacity,
            uint256 registered,
            string memory uri
        )
    {
        require(eventId > 0 && eventId <= currentEventId, "Invalid eventId");
        Event storage e = events[eventId];
        return (
            e.tokenId,
            e.name,
            e.location,
            e.date,
            e.capacity,
            e.registered,
            e.baseURI
        );
    }

    function getAttendeeTokenId(
        uint256 eventId,
        address attendee
    ) external view returns (uint256) {
        return attendeeTokenIds[eventId][attendee];
    }

    function getCurrentEventId() external view returns (uint256) {
        return currentEventId;
    }

    function getCurrentTokenId() external view returns (uint256) {
        return currentTokenId;
    }

    function constructMetadataURL(
        uint256 tokenId,
        string memory baseURI
    ) public pure returns (string memory) {
        string memory slash = bytes(baseURI)[bytes(baseURI).length - 1] == "/"
            ? ""
            : "/";
        return
            string(
                abi.encodePacked(
                    baseURI,
                    slash,
                    Strings.toString(tokenId),
                    ".json"
                )
            );
    }

    // Override the uri function to return the constructed metadata URL
    function uri(uint256 tokenId) public view override returns (string memory) {
        // Search for the event that created this token
        for (uint256 i = 1; i <= currentEventId; i++) {
            if (events[i].tokenId == tokenId) {
                return constructMetadataURL(tokenId, events[i].baseURI);
            }
        }
        // Fallback to the default URI
        return super.uri(tokenId);
    }

    // ERC1155 Receiver Functions

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
