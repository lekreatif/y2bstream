import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  youtubeApi: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUrl: process.env.YOUTUBE_REDIRECT_URL,
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    streamUrl: process.env.YOUTUBE_STREAM_URL,
  },
  directories: {
    songs: path.join(__dirname, '../../media/songs'),
    videos: path.join(__dirname, '../../media/videos'),
    output: path.join(__dirname, '../../media/output'),
  },
  ffmpeg: {
    videoBitrate: '4000k', // 3000 kbps
    audioBitrate: '192k', // 192 kbps
  },
  healthCheck: {
    interval: 60000, // 1 minute
    port: 8080,
  },
  monitoring: {
    port: 8081,
  },
};
