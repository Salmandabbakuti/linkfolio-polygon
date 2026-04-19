import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/pages/handle";
import { linkFolioContract } from "@/utils";

const DEFAULT_DESCRIPTION =
  "Create and own your digital identity as a soulbound NFT with on-chain metadata on Polygon.";

export const Route = createFileRoute("/$handle")({
  loader: async ({ params }) => {
    const { handle } = params;
    const url = `https://linkfol-io.vercel.app/${handle}`;

    const metadata = {
      title: handle,
      description: DEFAULT_DESCRIPTION,
      image: null,
      url,
      siteName: "LinkFolio"
    };

    try {
      const handleTokenId = await linkFolioContract.handleToTokenId(handle);
      const profile = await linkFolioContract.profiles(handleTokenId);

      if (profile?.name) {
        metadata.title = profile.name;
        metadata.description = profile.bio || DEFAULT_DESCRIPTION;
        metadata.image = profile.avatar || null;
      }
    } catch (error) {
      console.error(
        "Error generating metadata. returning default metadata",
        error
      );
    }

    return metadata;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title || "LinkFolio";
    const description = loaderData?.description || DEFAULT_DESCRIPTION;
    const canonicalUrl = loaderData?.url || "https://linkfol-io.vercel.app";
    const image = loaderData?.image;
    const siteName = loaderData?.siteName || "LinkFolio";

    return {
      meta: [
        { title: `${title} | ${siteName}` },
        { name: "description", content: description },
        { name: "category", content: "technology" },
        { property: "og:title", content: `${title} | ${siteName}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:site_name", content: siteName },
        { property: "og:locale", content: "en_US" },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${title} | ${siteName}` },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
        { name: "robots", content: "index, follow" }
      ],
      links: [{ rel: "canonical", href: canonicalUrl }]
    };
  },
  component: ProfilePage
});
