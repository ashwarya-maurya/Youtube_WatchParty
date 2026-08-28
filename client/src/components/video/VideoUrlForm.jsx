import { useState } from "react";
import { extractYouTubeVideoId } from "../../utils/youtube";

const VideoUrlForm = ({ onVideoSelected }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      setError("Please enter a valid YouTube video URL.");
      return;
    }

    setError("");
    onVideoSelected(videoId);
    setUrl("");
  };

  return (
    <form className="video-url-form" onSubmit={handleSubmit}>
      <label htmlFor="youtube-url">YouTube URL</label>

      <div className="video-url-form-row">
        <input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setError("");
          }}
          placeholder="https://www.youtube.com/watch?v=..."
        />

        <button type="submit">Load Video</button>
      </div>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default VideoUrlForm;
