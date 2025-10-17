// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract LinkFolio is ERC721 {
    using Strings for uint256;

    uint256 public nextTokenId = 1;

    enum ProfileCategory {
        Personal,
        Creator,
        Business
    }

    struct Profile {
        uint256 tokenId;
        string name;
        string handle;
        ProfileCategory category;
        string bio;
        string avatar;
        address owner;
        string settingsHash; // ipfs hash of the profile appearance settings json
        string[] linkKeys;
        mapping(string => string) links;
    }

    struct Note {
        uint256 id;
        string content;
        address author;
        uint256 tipAmount;
    }

    struct Post {
        uint256 id;
        string content;
        address author;
    }

    // profiles
    mapping(uint256 tokenId => Profile profile) public profiles;
    mapping(string handle => uint256 tokenId) public handleToTokenId;
    // notes
    mapping(string handle => mapping(uint256 noteId => Note note))
        public notesByHandle;
    mapping(uint256 tokenId => uint256 noteCount) public profileNoteCount;
    // posts
    mapping(string handle => mapping(uint256 postId => Post post))
        public postsByHandle;
    mapping(uint256 tokenId => uint256 postCount) public profilePostCount;

    event ProfileCreated(
        uint256 indexed tokenId,
        string name,
        string handle,
        ProfileCategory category,
        string bio,
        string avatar,
        address owner,
        string[] linkKeys,
        string[] links,
        string settingsHash
    );

    event ProfileUpdated(
        uint256 indexed tokenId,
        string name,
        string handle,
        ProfileCategory category,
        string bio,
        string avatar,
        address owner,
        string[] linkKeys,
        string[] links,
        string settingsHash
    );

    event ProfileDeleted(uint256 indexed tokenId, string handle);

    event NoteLeft(
        uint256 indexed tokenId,
        string handle,
        uint256 noteId,
        string content,
        address author,
        uint256 tipAmount
    );

    event PostCreated(
        uint256 indexed tokenId,
        string handle,
        uint256 postId,
        string content,
        address author
    );

    constructor() ERC721("LinkFolio", "LIFO") {}

    modifier onlyProfileOwner(uint256 _tokenId) {
        address profileOwner = _ownerOf(_tokenId);
        require(profileOwner != address(0), "LinkFolio: Profile doesnot exist");
        require(
            profileOwner == msg.sender,
            "LinkFolio: only profile owner can perform this action"
        );
        _;
    }

    function createProfile(
        string memory _name,
        string memory _handle,
        ProfileCategory _category,
        string memory _bio,
        string memory _avatar,
        string[] memory _linkKeys,
        string[] memory _links,
        string memory _settingsHash
    ) external {
        require(
            _linkKeys.length == _links.length,
            "LinkFolio: links and linkKeys length must match"
        );
        require(handleToTokenId[_handle] == 0, "LinkFolio: handle is taken");
        require(
            bytes(_handle).length >= 3 && bytes(_handle).length <= 15,
            "LinkFolio: handle must be between 3-15 characters"
        );
        require(bytes(_name).length > 0, "LinkFolio: name cannot be empty");

        uint256 currentTokenId = nextTokenId++;
        handleToTokenId[_handle] = currentTokenId;

        Profile storage newProfile = profiles[currentTokenId];
        newProfile.tokenId = currentTokenId;
        newProfile.name = _name;
        newProfile.handle = _handle;
        newProfile.category = _category;
        newProfile.bio = _bio;
        newProfile.avatar = _avatar;
        newProfile.linkKeys = _linkKeys;
        newProfile.owner = msg.sender;
        newProfile.settingsHash = _settingsHash;

        for (uint256 i = 0; i < _linkKeys.length; i++) {
            newProfile.links[_linkKeys[i]] = _links[i];
        }
        _safeMint(msg.sender, currentTokenId);
        emit ProfileCreated(
            currentTokenId,
            _name,
            _handle,
            _category,
            _bio,
            _avatar,
            msg.sender,
            _linkKeys,
            _links,
            _settingsHash
        );
    }

    function updateProfile(
        uint256 _tokenId,
        string memory _name,
        ProfileCategory _category,
        string memory _bio,
        string memory _avatar,
        string[] memory _linkKeys,
        string[] memory _links,
        string memory _settingsHash
    ) external onlyProfileOwner(_tokenId) {
        require(
            _linkKeys.length == _links.length,
            "LinkFolio: links and linkKeys length must match"
        );

        Profile storage profile = profiles[_tokenId];
        profile.name = _name;
        profile.category = _category;
        profile.bio = _bio;
        profile.avatar = _avatar;
        profile.settingsHash = _settingsHash;
        profile.linkKeys = _linkKeys;

        for (uint256 i = 0; i < _linkKeys.length; i++) {
            profile.links[_linkKeys[i]] = _links[i];
        }
        emit ProfileUpdated(
            _tokenId,
            _name,
            profile.handle,
            _category,
            _bio,
            _avatar,
            msg.sender,
            _linkKeys,
            _links,
            _settingsHash
        );
    }

    function deleteProfile(
        uint256 _tokenId
    ) external onlyProfileOwner(_tokenId) {
        string memory handle = profiles[_tokenId].handle;
        delete handleToTokenId[handle];
        delete profiles[_tokenId];
        _burn(_tokenId);
        emit ProfileDeleted(_tokenId, handle);
    }

    function leaveNote(
        string memory _handle,
        string memory _content
    ) external payable {
        uint256 tokenId = handleToTokenId[_handle];
        require(
            _ownerOf(tokenId) != address(0),
            "LinkFolio: Profile not found by handle"
        );
        require(
            bytes(_content).length > 0 && bytes(_content).length <= 280,
            "LinkFolio: content must be between 1-280 characters"
        );
        uint256 noteId = profileNoteCount[tokenId]++;
        notesByHandle[_handle][noteId] = Note(
            noteId,
            _content,
            msg.sender,
            msg.value
        );

        // If tip amount is provided, transfer it to the profile owner
        if (msg.value > 0) {
            address profileOwner = _ownerOf(tokenId);
            (bool success, ) = payable(profileOwner).call{value: msg.value}("");
            require(success, "LinkFolio: Failed to transfer tip");
        }

        emit NoteLeft(
            tokenId,
            _handle,
            noteId,
            _content,
            msg.sender,
            msg.value
        );
    }

    function createPost(
        uint256 _tokenId,
        string memory _content
    ) external onlyProfileOwner(_tokenId) {
        string memory _handle = profiles[_tokenId].handle;
        require(
            bytes(_content).length > 0 && bytes(_content).length <= 1000,
            "LinkFolio: content must be between 1-1000 characters"
        );
        uint256 postId = profilePostCount[_tokenId]++;
        postsByHandle[_handle][postId] = Post(postId, _content, msg.sender);
        emit PostCreated(_tokenId, _handle, postId, _content, msg.sender);
    }

    // override to prevent transfers
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || to == address(0),
            "LinkFolio: Profile is non-transferable"
        );
        return super._update(to, tokenId, auth);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "LinkFolio: URI query for nonexistent token"
        );
        return _getTokenURI(tokenId);
    }

    function _getTokenURI(
        uint256 tokenId
    ) internal view returns (string memory) {
        Profile storage profile = profiles[tokenId];

        string memory category = categoryToString(profile.category);
        // Initialize attributes array with fixed attributes
        bytes[] memory attributesArray = new bytes[](
            profile.linkKeys.length + 5
        );
        attributesArray[0] = abi.encodePacked(
            '{"trait_type":"name", "value":"',
            profile.name,
            '"}'
        );
        attributesArray[1] = abi.encodePacked(
            '{"trait_type":"handle", "value":"',
            profile.handle,
            '"}'
        );
        attributesArray[2] = abi.encodePacked(
            '{"trait_type":"bio", "value":"',
            profile.bio,
            '"}'
        );
        attributesArray[3] = abi.encodePacked(
            '{"trait_type":"tokenId", "value":"',
            tokenId.toString(),
            '"}'
        );
        attributesArray[4] = abi.encodePacked(
            '{"trait_type":"category", "value":"',
            category,
            '"}'
        );

        // Add links as additional attributes to the attributes array
        for (uint256 i = 0; i < profile.linkKeys.length; i++) {
            string memory key = profile.linkKeys[i];
            string memory value = profile.links[key];
            if (bytes(value).length > 0) {
                bytes memory linkAttribute = abi.encodePacked(
                    '{"trait_type":"',
                    key,
                    '", "value":"',
                    value,
                    '"}'
                );
                attributesArray[i + 5] = linkAttribute;
            }
        }

        // Convert attributes array to JSON format
        bytes memory attributesJson = abi.encodePacked(
            "[",
            bytesJoin(attributesArray, ","),
            "]"
        );

        // Construct the entire JSON
        bytes memory json = abi.encodePacked(
            '{"name":"',
            profile.name,
            '", "description":"',
            profile.bio,
            '", "image":"',
            profile.avatar,
            '", "external_url":"",',
            '"attributes":',
            attributesJson,
            "}"
        );

        // Concatenate Base64 with data URI
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

    // Helper function to join bytes in an array with a delimiter
    function bytesJoin(
        bytes[] memory parts,
        bytes memory delimiter
    ) internal pure returns (bytes memory) {
        if (parts.length == 0) return "";
        bytes memory output = parts[0];
        for (uint256 i = 1; i < parts.length; i++) {
            output = abi.encodePacked(output, delimiter, parts[i]);
        }
        return output;
    }

    // category enum to string conversion
    function categoryToString(
        ProfileCategory category
    ) internal pure returns (string memory) {
        if (category == ProfileCategory.Personal) return "Personal";
        if (category == ProfileCategory.Creator) return "Creator";
        if (category == ProfileCategory.Business) return "Business";
        return "Unknown";
    }
}
