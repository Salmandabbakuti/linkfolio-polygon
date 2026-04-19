import { createFileRoute } from "@tanstack/react-router";
import ExplorePage from "@/pages/explore";

export const Route = createFileRoute("/explore")({
  component: ExplorePage
});
