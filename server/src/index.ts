import express, { Request, Response } from "express";
import cors from "cors";
import youtubedl from "youtube-dl-exec";
import { isURL } from "validator";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("YouTube Downloader API is running 🚀");
});

// Endpoint to fetch video info
app.get("/video-info", async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;

    // Validate URL
    if (!rawUrl || !isURL(rawUrl)) {
      console.log("Invalid URL received:", rawUrl);
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    console.log("Fetching info for URL:", rawUrl);

    const info: any = await youtubedl(rawUrl, {
      dumpSingleJson: true,
      noWarnings: true,
    });

    return res.json({
      success: true,
      title: info.title,
      thumbnail: info.thumbnail,
      author: info.uploader,
      duration: info.duration,
    });
  } catch (error: any) {
    console.log("ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Endpoint to download video
app.get("/download", async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    // Validate URL
    if (!url || !isURL(url)) {
      console.log("Invalid URL received for download:", url);
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    console.log("Starting download for URL:", url);

    const filename = `video-${Date.now()}.mp4`;

    res.header(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.header("Content-Type", "video/mp4");

    const ytdlProcess = youtubedl.exec(
      url,
      {
        format: "mp4",
        output: "-",
      },
      {
        stdio: ["ignore", "pipe", "ignore"],
      }
    );

    if (ytdlProcess.stdout) {
      ytdlProcess.stdout.pipe(res);
    } else {
      console.error("Failed to get stdout from youtube-dl process");
      return res.status(500).end("Failed to stream video");
    }

    ytdlProcess.on("error", (err: any) => {
      console.error("Streaming error:", err);
      res.status(500).end("Error during download");
    });
  } catch (error: any) {
    console.log("DOWNLOAD ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});