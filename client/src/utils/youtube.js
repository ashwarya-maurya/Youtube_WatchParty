export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    if (hostname === "youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/embed/")[1] || null;
      }
    }

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1) || null;
    }

    return null;
  } catch {
    return null;
  }
};