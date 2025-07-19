# LinkFolio - Decentralized, Portable, and Ownable link profiles as NFTs

LinkFolio is a platform enabling users to craft personalized digital profiles transformed into non-fungible tokens (NFTs). Seamlessly curate your profile with a bio, avatar, and custom links to social media, portfolios, and more. With LinkFolio, your digital identity becomes a unique NFT asset, offering ownership and authenticity. Whether you're a creator, influencer, or professional, LinkFolio provides a streamlined solution to manage your digital presence as valuable NFTs.

Built on NERO Chain, LinkFolio leverages native Account Abstraction (AA) and Paymaster infrastructure to deliver a gasless, seamless onboarding experience. Users can claim and update their profiles without ever needing to hold or manage gas tokens, eliminating a major barrier to Web3 adoption.

Craft your unique bio, avatar, and links to social media as properties and attributes of your nft. Own your soulbound digital identity effortlessly fully onchain. Think of it as web3 version of linktree profile as digital collectible.

### Features

- **Gasless Experience:** Powered by NERO Chain Paymaster, users can interact without paying gas fees using ETH or stablecoins.
- **Native Account Abstraction:** Streamlines wallet interactions and enhances user experience through smart contract-based wallets.
- **Soulbound NFT Profiles:** Each profile is minted as a unique, non-transferrable NFT ensuring true ownership and authenticity.
- **On-Chain Metadata:** All profile data is stored directly on-chain, ensuring permanence, integrity, and decentralization.
- **Posts/Updates:** Share updates or announcements with your community through posts, enhancing engagement.
- **Community Notes with Tips:** Allow community members to leave quick thoughts or messages on your profile and send tips to support creators, fostering interaction.
- **Customizable Design:** Personalize your profile with custom themes, colors, fonts, and layouts to match your brand.
- **Profile Templates:** Professional templates and appearance customization with live preview functionality.

![lfv04-appearance-settings-form-sc](https://github.com/user-attachments/assets/322e5940-ab27-4deb-ac13-49b3da1526e4)

**Contract Address:** [0xd231fE46b4A8500d4aDD5AD98EC3c4ca56E7dee4](https://neroscan.io/address/0xd231fE46b4A8500d4aDD5AD98EC3c4ca56E7dee4?tab=Transactions). Deployed on Nerochain Mainnet.

## Getting Started

### 1. Deploying the Smart Contracts

This project is scaffolded using [hardhat](https://hardhat.org/docs). Please refer to the documentation for more information on folder structure and configuration.

> Copy the `.env.example` file to `.env` and update the environment variables with your own values.

```bash

npm install

npx hardhat compile

npx hardhat ignition deploy ./ignition/modules/LinkFolio.ts --network neroMainnet
```

### 2. Deploying Subgraph

> Subgraph will be deployed to NERO Chain's hosted Sandbox environment. Please refer to the [Graph Node documentation](https://thegraph.com/docs/en/indexing/tooling/graph-node/) for more information on how to set up your environment. Update `package.json` scripts to point to your local Graph Node if you are running one.

```bash

cd subgraph

npm install

npm run codegen

npm run create-remote # create a new subgraph on the sandbox environment

npm run deploy-remote # deploy the subgraph to the sandbox environment
```

### 3. Running the Client

> Copy the `.env.example` file to `.env` and update the environment variables with your own values.

```bash
cd client

npm install

npm run dev
```

Open http://localhost:3000 with your browser to see the result.

### Paymaster and AA Integration

The core implemtation of Paymaster and Account Abstraction(AA) can be found in [`client/app/utils/aaUtils.js`](client/app/utils/aaUtils.js)

Interaction flow is demonstrated in [Creation, Update, Delete of Profiles](client/app/[handle]/page.client.jsx#L181) and in [Creation of posts and notes](client/app/components/ProfileCard.jsx#L62),
where the user is prompted to sign a message to create a profile, post or note. The Paymaster handles the gasless transaction and the AA SDK manages the smart contract wallet interactions.

### Demo

![lfv04-appearance-settings-sc](https://github.com/user-attachments/assets/32108429-f3b1-445e-822e-350e37f46ea9)
![lfv04-appearance-settings-form-sc](https://github.com/user-attachments/assets/322e5940-ab27-4deb-ac13-49b3da1526e4)
![lfv04-edit-profile-sc](https://github.com/user-attachments/assets/0b95ce18-2f6b-4cbe-8022-52165ab2b5d6)
![lfv04-notes-tips-sc](https://github.com/user-attachments/assets/6d78895c-7642-49c6-9243-424c1737fba8)
![lfv04-posts-sc](https://github.com/user-attachments/assets/da95a7b2-6579-4595-97f6-ca1bff16ca6c)
![lfv04-explore-sc](https://github.com/user-attachments/assets/160aa900-c888-4723-b330-c1f922cff4d4)

### ChangeLog

#### 0.5.0

- Added font family preview in appearance settings dropdown and new font options (Poppins, Cursive)
- Implemented unsaved changes warnings on leave while editing and improved profile card interactions
- Added avatar and banner preview capabilities using Ant Design Image components
- Enhanced profile tabs with URL state management and consistent font styles
- Added profile creation and update timestamps in the profile card
- Enhanced ProfileCard with dynamic styling system and improved layout architecture
- Updated footer styling and optimized codebase by cleaning up unused Ant Design theme tokens

#### 0.4.2 (Mainnet)

- Mainnet deployment of contract, subgraph and client application.

#### 0.4.1

- Added comprehensive appearance customization for profiles with live preview.
- Introduced tipping functionality for notes, sending tips directly to profile owners.
- Notes with tips display tip amounts and include links to view transactions on the blockchain explorer.
- Added IPFS upload support for avatars and profile appearance settings.
- Provided curated profile templates for quick style application to profiles.
- Complete UI revamp with redesigned home page featuring hero section, features showcase, how it works guide, stats, and enhanced footer.
- Improved component architecture with CSS modules for better maintainability and performance.
- Enhanced responsive design and mobile optimization across all pages.

#### 0.3.0

- Added profile category selection (Creator, Business, Personal) during onboarding.
- Integrated loading spinner during transaction submission for better UX feedback. Redirections and messages post profile creation/updation.
- Smoother profile creation/update (form improvements) flow – users now select social platforms first and then add their links.
- Added separate explore page to discover profiles on the platform.
- Revamped homepage layout and design for better first impressions and user experience.

#### 0.2.0

- Added notes feature for profiles to let community members leave quick thoughts or messages.
- Added posts feature for profile owners to share updates or announcements.
- Integrated NERO Account Abstraction (AA) and Paymaster for gasless note and post creation.
- Added subgraph for indexing and querying profile data, posts, notes.
- Added Explore section in home page to discover community profiles with search and filter options using subgraph.
- Added profile metadata for individual handle pages to enable rich link previews when shared.

#### 0.1.0 - Initial Release

- Initial release of LinkFolio, a decentralized platform for creating and managing personalized digital profiles as NFTs.
- Integrated NERO platform AA and paymaster for seamless user experience.
- Users can create, update, and manage their profiles with a bio, avatar, and custom links.

### References

- [Dapp Architecture - Nero Chain](https://docs.nerochain.io/en/getting-started/nero-dapp-architecture)
- [AA Wallet Integration - NERO Chain](https://docs.nerochain.io/en/tutorials/aa-wallet-integration)
- [Create your first Dapp - NERO Chain](https://docs.nerochain.io/en/tutorials/create-first-dapp)
- [Openzeppelin ERC721 DOCS](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [ERC721 Metadata Standards](https://docs.opensea.io/docs/metadata-standards)
- [ERC721 Soulbound Reference](https://ethereum.stackexchange.com/a/161807)
- [ERC721 Onchain Metadata](https://andyhartnett.medium.com/solidity-tutorial-how-to-store-nft-metadata-and-svgs-on-the-blockchain-6df44314406b)
- [Constructing Onchain Metadata directly in tokenURI without storing offchain](https://stackoverflow.com/a/70924789)
- [Appkit Overview](https://docs.reown.com/appkit/overview)

## Built With

- [NERO Chain](https://nerochain.io/) - Fully Modular Blockchain Architecture for Enhanced Adaptation and Performance
- [NERO Chain Platform Paymaster](https://nerochain.io/paymaster) - Allows seamless gas sponsorships, gas fee payments using any token or stablecoin of your choice
- [NERO Chain AA sdk](https://docs.nerochain.io/en/developer-tools/user-op-sdk) - Native account abstraction support for enhanced security and privacy by Nerochain
- [Hardhat](https://hardhat.org/) - Ethereum development environment for professionals
- [Reown Appkit](https://reown.com/appkit) - The full stack toolkit to build onchain app UX.
- [Ethers.js](https://docs.ethers.io/v5/) - A complete and compact library for interacting with the Ethereum Blockchain and its ecosystem.
- [Next.js](https://nextjs.org/) - The React Framework for Production.
- [Ant Design](https://ant.design/) - A design system for enterprise-level products. Create an efficient and enjoyable work experience.

## Safety

This is experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk. I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
