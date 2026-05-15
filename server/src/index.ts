import express, { Request, Response } from "express";
import cors from "cors";
import youtubedl from "youtube-dl-exec";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());


app.get("/", (req: Request, res: Response) => {
  res.send("YouTube Downloader API is running 🚀");
});


app.get("/video-info", async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string;

    if (!rawUrl) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const cleanUrl = rawUrl.split("?")[0];

    const info: any = await youtubedl(cleanUrl, {
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


app.get("/download", async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const title = `video-${Date.now()}.mp4`;

    res.header(
      "Content-Disposition",
      `attachment; filename="${title}"`
    );

    const process = youtubedl.exec(
      url,
      {
        format: "mp4",
        output: "-",
      },
      {
        stdio: ["ignore", "pipe", "ignore"],
      }
    );

    if (process.stdout) {
      process.stdout.pipe(res);
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to start download stream",
      });
    }
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