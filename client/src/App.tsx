import { useState } from "react";
import axios from "axios";
type VideoType = {
  title: string;
  thumbnail: string;
  author: string;
};

function App() {
  const [url, setUrl] = useState("");
const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(false);

  const getVideoInfo = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/video-info",
        {
          params: { url },
        }
      );

      setVideo(res.data);

    } catch (error) {
      alert("Invalid URL");
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = () => {
    window.open(
      `http://localhost:5000/download?url=${url}`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111",
        color: "white",
      }}
    >
      <div
        style={{
          width: "400px",
          textAlign: "center",
        }}
      >
        <h1>YouTube Downloader</h1>

        <input
        className="text-black"
          type="text"
          placeholder="Paste YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
          }}
        />

        <button
          onClick={getVideoInfo}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Get Video"}
        </button>

        {video && (
          <div style={{ marginTop: "20px" }}>
            <img
              src={video.thumbnail}
              alt={video.title}
              width="100%"
            />

            <h3>{video.title}</h3>

            <p>{video.author}</p>

            <button
              onClick={downloadVideo}
              style={{
                padding: "12px 20px",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              Download MP4
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;