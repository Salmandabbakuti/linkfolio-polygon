import { Contract, JsonRpcProvider } from "ethers";
import { GraphQLClient, gql } from "graphql-request";
import {
  XOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  GithubOutlined,
  GlobalOutlined,
  DiscordOutlined,
  FrownOutlined,
  CodeOutlined,
  LinkedinOutlined,
  InstagramOutlined
} from "@ant-design/icons";
import { LINKFOLIO_CONTRACT_ADDRESS } from "./constants";

export const supportedSocials = [
  { id: "facebook", name: "Facebook", icon: <FacebookOutlined /> },
  { id: "youtube", name: "YouTube", icon: <YoutubeOutlined /> },
  { id: "github", name: "GitHub", icon: <GithubOutlined /> },
  { id: "snapchat", name: "Snapchat", icon: <GlobalOutlined /> },
  { id: "telegram", name: "Telegram", icon: <GlobalOutlined /> },
  { id: "discord", name: "Discord", icon: <DiscordOutlined /> },
  { id: "farcaster", name: "Farcaster", icon: <FrownOutlined /> },
  { id: "blockchain", name: "Blockchain", icon: <CodeOutlined /> },
  { id: "linkedin", name: "LinkedIn", icon: <LinkedinOutlined /> },
  { id: "x", name: "X", icon: <XOutlined /> },
  { id: "instagram", name: "Instagram", icon: <InstagramOutlined /> },
  { id: "other", name: "Other", icon: <GlobalOutlined /> }
];

const linkFolioContractABI = [
  "function createProfile(string _name, string _handle, uint8 _category, string _bio, string _avatar, string[] _linkKeys, string[] _links, address _eoa)",
  "function updateProfile(uint256 _tokenId, string _name, uint8 _category, string _bio, string _avatar, string[] _linkKeys, string[] _links)",
  "function deleteProfile(uint256 _tokenId)",
  "function leaveNote(string _handle, string _content)",
  "function createPost(uint256 _tokenId, string _content)",
  "function profiles(uint256 tokenId) view returns (uint256 tokenId, string name, string handle, uint8 category, string bio, string avatar, address owner, address _eoa)",
  "function handleToTokenId(string handle) view returns (uint256 tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string uri)"
];

// nero testnet provider
const defaultProvider = new JsonRpcProvider(
  "https://rpc-testnet.nerochain.io",
  689,
  {
    staticNetwork: true
  }
);

export const linkFolioContract = new Contract(
  LINKFOLIO_CONTRACT_ADDRESS,
  linkFolioContractABI,
  defaultProvider
);

const subgraphUrl =
  process.env.NEXT_PUBLIC_SUBGRAPH_API_URL ||
  "https://subgraph.testnet.nero.metaborong.com/subgraphs/name/linkfolio-nero";

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
      linkKeys
      links
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
