import { useRef } from "react";
import YouTube from "react-youtube";

const YouTubePlayer = ({ videoId }) => {
  const playerRef = useRef(null);

  const handleReady = (event) => {
    playerRef.current = event.target;
  };

  if (!videoId) {
    return (
      <section>
        <p>No video selected yet.</p>
        <p>Enter a YouTube URL to load a video for this room.</p>
      </section>
    );
  }

  return (
    <section>
      <YouTube
        videoId={videoId}
        onReady={handleReady}
        opts={{
          width: "100%",
          playerVars: {
            controls: 1,
          },
        }}
      />
    </section>
  );
};

export default YouTubePlayer;