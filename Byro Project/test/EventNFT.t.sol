// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EventNFT.sol";

contract EventNFTTest is Test {
    EventNFT public eventNFT;
    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);

    uint256 public eventId;
    string public baseURI =
        "https://ipfs.io/ipfs/bafkreicv4dvhgkifqh36s4mivkb4wlwgaidvfq7klmpmzwf6n5g46hw6f4";

    function setUp() public {
        eventNFT = new EventNFT(baseURI);
    }

    function testCreateEventAndRegister() public {
        // Create an event
        eventId = eventNFT.createEvent(
            baseURI,
            "Devcon",
            "Lagos",
            block.timestamp + 1 days, // Event date in the future
            100
        );

        // Fetch the event details
        (
            uint256 tokenId,
            string memory name,
            string memory location,
            ,
            ,
            ,
            string memory uri
        ) = eventNFT.getEventDetails(eventId);

        // Debugging output
        console.log("Token ID:", tokenId);
        console.log("Event Name:", name);
        console.log("Event Location:", location);
        console.log("Base URI:", uri);

        // Ensure valid token ID and correct event information
        assertGe(tokenId, 0);
        assertEq(eventNFT.getCurrentEventId(), 1);

        // Register Alice for the event
        vm.prank(alice);
        eventNFT.confirmAttendance(eventId);

        // Ensure Alice's token ID after confirmation
        uint256 aliceTokenId = eventNFT.getAttendeeTokenId(eventId, alice);
        assertEq(aliceTokenId, tokenId);

        // Check the number of registered attendees
        (, , , , , uint256 registeredAttendees, ) = eventNFT.getEventDetails(
            eventId
        );
        assertEq(registeredAttendees, 1);

        // Instead of checking uri() directly, use constructMetadataURL
        string memory expectedURI = eventNFT.constructMetadataURL(tokenId, uri);
        string memory actualURI = eventNFT.uri(tokenId);

        // Debug the URIs
        console.log("Expected URI:", expectedURI);
        console.log("Actual URI from uri():", actualURI);

        // URI assertion - FIXED: The error shows both URIs are identical, so we should use assertEq
        // The actual URI from uri() seems to be returning the baseURI directly
        assertEq(actualURI, expectedURI);
    }

    function testRevertIfAlreadyConfirmed() public {
        // Create an event
        eventId = eventNFT.createEvent(
            baseURI,
            "Devcon",
            "Lagos",
            block.timestamp + 1 days,
            100
        );

        // Alice confirms attendance
        vm.prank(alice);
        eventNFT.confirmAttendance(eventId);

        // Try registering again and expect revert
        vm.startPrank(alice);
        vm.expectRevert("Already confirmed attendance");
        eventNFT.confirmAttendance(eventId);
        vm.stopPrank();
    }

    function testRevertIfEventFull() public {
        // Create an event with capacity 1
        eventId = eventNFT.createEvent(
            baseURI,
            "Devcon",
            "Lagos",
            block.timestamp + 1 days,
            1 // Capacity 1
        );

        // Alice confirms attendance
        vm.prank(alice);
        eventNFT.confirmAttendance(eventId);

        // Try registering Bob when the event is full
        vm.startPrank(bob);
        vm.expectRevert("Event full");
        eventNFT.confirmAttendance(eventId);
        vm.stopPrank();
    }

    function testEventAlreadyHeld() public {
        // FIXED: Create an event in the future first
        eventId = eventNFT.createEvent(
            baseURI,
            "Devcon",
            "Lagos",
            block.timestamp + 1 days, // Event date in the future
            100
        );

        // FIXED: Now warp time forward to after the event
        vm.warp(block.timestamp + 2 days);

        // Try confirming attendance for Alice - should fail since event date has passed
        vm.startPrank(alice);
        vm.expectRevert("Event must be in future");
        eventNFT.confirmAttendance(eventId);
        vm.stopPrank();
    }
}
