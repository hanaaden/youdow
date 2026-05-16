import { useState } from 'react';
import axios from 'axios';

type VideoType = {
    title: string;
    thumbnail: string;
    author: string;
    duration: number;
};

function App() {
    const [url, setUrl] = useState('');
    const [video, setVideo] = useState<VideoType | null>(null);
    const [loading, setLoading] = useState(false);

    const getVideoInfo = async () => {
        try {
            setLoading(true);

            const res = await axios.get('http://localhost:5000/video-info', {
                params: { url },
            });

            setVideo(res.data);
        } catch (error) {
            console.log(error);
            alert('Failed to fetch video info');
        } finally {
            setLoading(false);
        }
    };

    const downloadVideo = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/download?url=${encodeURIComponent(url)}`,
                { responseType: 'blob' }
            );

            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `video-${Date.now()}.mp4`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert('Download failed');
        }
    };

    return (
       <div className="min-h-screen w-full flex items-center justify-center bg-[#0f0f12] px-4 py-12 font-sans antialiased text-white">
  <div className="w-full max-w-lg rounded-3xl bg-[#1a1a24] p-6 sm:p-10 shadow-2xl border border-white/5 text-center transition-all duration-300">
    
    {/* Hero Header */}
    <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-[#ff0055] to-[#ff5500] bg-clip-text text-transparent">
      YouTube Downloader
    </h1>
    <p className="text-sm sm:text-base text-[#8e8e9f] mb-8 max-w-sm mx-auto">
      Convert and download your favorite videos instantly in high quality.
    </p>

    {/* Input & Action Section */}
    <div className="flex flex-col gap-4 mb-8">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube video link here..."
        className="w-full px-5 py-4 rounded-xl border-2 border-[#2e2e3f] bg-[#111118] text-white placeholder-[#52526b] text-base outline-none focus:border-[#ff0055] transition-colors duration-200"
      />

      <button
        onClick={getVideoInfo}
        disabled={loading}
        className={`w-full py-4 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 active:scale-[0.99] ${
          loading
            ? 'bg-[#2e2e3f] text-[#8e8e9f] cursor-not-allowed shadow-none'
            : 'bg-[#ff0055] hover:bg-[#e6004c] text-white shadow-[#ff0055]/20'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing Link...
          </span>
        ) : (
          'Fetch Video'
        )}
      </button>
    </div>

    {/* Dynamic Video Preview Card */}
    {video && (
      <div className="mt-6 p-5 rounded-2xl bg-[#111118] border border-[#2e2e3f] text-left animate-fadeIn">
        <div className="relative overflow-hidden rounded-xl aspect-video mb-4 shadow-inner group">
          <img
            src={video.thumbnail}
            alt="Video Preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 leading-snug truncate">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#8e8e9f] mb-5">
          {video.author}
        </p>

        <button
          onClick={downloadVideo}
          className="w-full py-3.5 rounded-xl bg-[#00cc66] hover:bg-[#00b359] text-white text-sm sm:text-base font-semibold shadow-md shadow-[#00cc66]/10 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Media
        </button>
      </div>
    )}
  </div>
</div>
    );
}

export default App;