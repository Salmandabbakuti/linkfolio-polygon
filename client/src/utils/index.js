import { Contract, JsonRpcProvider } from "ethers";
import { GraphQLClient, gql } from "graphql-request";
import { LINKFOLIO_CONTRACT_ADDRESS } from "./constants";

export const DEFAULT_APPEARANCE_SETTINGS = {
  fontFamily: "Inter, sans-serif",
  fontSize: 16,
  background: "#1F1A2D",
  accentColor: "#1890FF",
  cardStyle: "solid",
  buttonShape: "pill",
  linkStyle: "bold",
  textColor: "#E8E8E8",
  avatarShape: "circle",
  banner: ""
};

// polygon amoy provider
const defaultProvider = new JsonRpcProvider("https://rpc-amoy.polygon.technology", 80002, {
  staticNetwork: true
});

const linkFolioContractABI = [
  "function createProfile(string _name, string _handle, uint8 _category, string _bio, string _avatar, string[] _linkKeys, string[] _links, string _settingsHash)",
  "function updateProfile(uint256 _tokenId, string _name, uint8 _category, string _bio, string _avatar, string[] _linkKeys, string[] _links, string _settingsHash)",
  "function deleteProfile(uint256 _tokenId)",
  "function leaveNote(string _handle, string _content) payable",
  "function createPost(uint256 _tokenId, string _content)",
  "function profiles(uint256 tokenId) view returns (uint256 tokenId, string name, string handle, uint8 category, string bio, string avatar, address owner)",
  "function handleToTokenId(string handle) view returns (uint256 tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string uri)"
];

export const linkFolioContract = new Contract(
  LINKFOLIO_CONTRACT_ADDRESS,
  linkFolioContractABI,
  defaultProvider
);

const subgraphUrl =
  import.meta.env.VITE_SUBGRAPH_API_URL ||
  "https://api.studio.thegraph.com/query/15343/linkfolio/version/latest";

export const subgraphClient = new GraphQLClient(subgraphUrl);

export const GET_PROFILES_QUERY = gql`
  query getProfiles(
    $first: Int
    $skip: Int
    $orderBy: Profile_orderBy
    $orderDirection: OrderDirection
    $where: Profile_filter
  ) {
    profiles(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      tokenId
      name
      handle
      category
      bio
      avatar
      owner {
        id
      }
      tipAmount
      owner
    }
  }
`;

export const GET_PROFILE_QUERY = gql`
  query getProfile(
    $id: ID!
    $notes_first: Int
    $notes_skip: Int
    $notes_orderBy: Note_orderBy
    $notes_orderDirection: OrderDirection
    $notes_where: Note_filter
    $posts_first: Int
    $posts_skip: Int
    $posts_orderBy: Post_orderBy
    $posts_orderDirection: OrderDirection
    $posts_where: Post_filter
  ) {
    profile(id: $id) {
      id
      tokenId
      name
      handle
      category
      bio
      avatar
      owner {
        id
      }
      tipAmount
      linkKeys
      links
      settingsHash
      notes(
        first: $notes_first
        skip: $notes_skip
        orderBy: $notes_orderBy
        orderDirection: $notes_orderDirection
        where: $notes_where
      ) {
        id
        content
        author
        tipAmount
        txHash
        createdAt
      }
      posts(
        first: $posts_first
        skip: $posts_skip
        orderBy: $posts_orderBy
        orderDirection: $posts_orderDirection
        where: $posts_where
      ) {
        id
        content
        author {
          id
          name
          handle
          avatar
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const PROFILE_EXISTS_QUERY = gql`
  query profile($id: ID!) {
    profile(id: $id) {
      id
      handle
    }
  }
`;

export const ellipsisString = (str, first, last) =>
  str.slice(0, first) + "..." + str.slice(-last);
