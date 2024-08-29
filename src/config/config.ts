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
    broadcastId: process.env.YOUTUBE_BROADCAST_ID,
  },
  directories: {
    thunbnails: path.join(__dirname, '../../media/thumbnails'),
    videos: path.join(__dirname, '../../media/videos'),
    output: path.join(__dirname, '../../media'),
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

export interface YouTubeApiConfig {
  clientId: string | undefined;
  clientSecret: string | undefined;
  redirectUrl: string | undefined;
  refreshToken: string | undefined;
  streamUrl: string | undefined;
  broadcastId: string | undefined; // Nouvelle ligne
}

// Assurez-vous que config.youtubeApi est de type YouTubeApiConfig
const youtubeApiConfig: YouTubeApiConfig = config.youtubeApi;

export { youtubeApiConfig };
