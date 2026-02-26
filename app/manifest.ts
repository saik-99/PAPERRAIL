import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KhetiWala - Smart Farming Advisory",
    short_name: "KhetiWala",
    description:
      "AI-powered agricultural advisory for Indian farmers — maximize income, minimize spoilage.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#007B41",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

