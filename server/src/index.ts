// server/src/index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('YouTube Downloader API is running 🚀');
});

// validate URL
const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

//
// =========================
// VIDEO INFO
// =========================
//
app.get('/video-info', (req: Request, res: Response) => {
    const url = req.query.url as string;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid URL',
        });
    }

    const yt = spawn('yt-dlp', [
        url,
        '--dump-single-json',
        '--no-warnings',
        '--prefer-free-formats'
    ]);

    let output = '';
    let errorOutput = '';

    yt.stdout.on('data', (data) => {
        output += data.toString();
    });

    yt.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    yt.on('close', (code) => {
        if (code !== 0) {
            console.log('YT ERROR:', errorOutput);

            return res.status(500).json({
                success: false,
                message: errorOutput || 'yt-dlp failed',
            });
        }

        try {
            const info = JSON.parse(output);

            return res.json({
                success: true,
                title: info.title,
                thumbnail: info.thumbnail,
                author: info.uploader,
                duration: info.duration,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to parse video info',
            });
        }
    });
});

//
// =========================
// DOWNLOAD VIDEO
// =========================
//
app.get('/download', (req: Request, res: Response) => {
    const url = req.query.url as string;

    if (!url || !isValidUrl(url)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid URL',
        });
    }

    const filename = `video-${Date.now()}.mp4`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const yt = spawn('yt-dlp', [
        url,
        '-f',
        'bestvideo+bestaudio/best',
        '--merge-output-format',
        'mp4',
        '-o',
        '-'
    ]);

    yt.stdout.pipe(res);

    yt.stderr.on('data', (data) => {
        console.log('DOWNLOAD ERROR:', data.toString());
    });

    yt.on('close', (code) => {
        if (code !== 0) {
            console.log('Download finished with code:', code);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});