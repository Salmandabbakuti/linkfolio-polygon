import Profile from "./page.client";
import { linkFolioContract } from "@/app/utils";

export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { handle } = await params;

  //  base metadata for the profile page
  const url = `https://linkfolio-nero.vercel.app/${handle}`;
  const siteName = "LinkFolio";
  let title = handle;
  let description =
    "Create and own your digital identity as a soulbound NFT with on-chain metadata, gas-free via NERO Chain’s Paymaster and account abstraction.";
  let image = null;

  try {
    const handleTokenId = await linkFolioContract.handleToTokenId(handle);
    const profile = await linkFolioContract.profiles(handleTokenId);
    if (profile && profile?.name) {
      title = profile?.name;
      description = profile?.bio || description;
      image = profile?.avatar;
    }
  } catch (error) {
    console.error(
      "Error generating metadata. returning default metadata",
      error
    );
  }

  return {
    title,
    description,
    category: "technology",
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      type: "profile",
      url,
      siteName,
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: handle }]
        : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: image ? { url: image, width: 1200, height: 630, alt: handle } : {}
    },
    // Canonical URL (Prevents duplicate content issues)
    alternates: {
      canonical: url
    },
    robots: "index, follow"
  };
}

export default Profile;
