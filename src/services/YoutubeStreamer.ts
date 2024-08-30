import { google, Auth, youtube_v3 } from 'googleapis';
import { config, youtubeApiConfig } from '../config/config';
import logger from '../utils/logger';
import { YouTubeAPIError } from '../utils/errors';
import fs from 'fs';
import path from 'path';

export class YouTubeStreamer {
  private oauth2Client: Auth.OAuth2Client;
  private youtube!: youtube_v3.Youtube;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.youtubeApi.clientId,
      config.youtubeApi.clientSecret
    );
    this.oauth2Client.setCredentials({
      refresh_token: config.youtubeApi.refreshToken,
    });
    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
  }

  public async refreshToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      logger.info('YouTube API token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh YouTube API token:', error);
      throw new YouTubeAPIError('Failed to refresh YouTube API token');
    }
  }

  public getStreamUrl(): string {
    if (!youtubeApiConfig.streamUrl) {
      throw new YouTubeAPIError('YouTube stream URL not configured');
    }
    return youtubeApiConfig.streamUrl;
  }
  public async updateStreamTitle(title: string): Promise<void> {
    if (!youtubeApiConfig.broadcastId) {
      throw new YouTubeAPIError('YouTube broadcast ID not configured');
    }
    try {
      await this.youtube.liveBroadcasts.update({
        part: ['snippet'],
        requestBody: {
          id: youtubeApiConfig.broadcastId,
          snippet: {
            title: `Vous suivez actuellemnt ${title} - Cinéma & TV en direct 24h/7 - La chaîne des créateurs de contenu`,
          },
        },
      });
      logger.info(`Updated stream title to: ${title}`);
    } catch (error) {
      logger.error(`Failed to update stream title ${title}: `, error);
      throw new YouTubeAPIError('Failed to update stream title');
    }
  }

  public async updateStreamThumbnail(thumbnailUrl: string): Promise<void> {
    if (!youtubeApiConfig.broadcastId) {
      throw new YouTubeAPIError('YouTube broadcast ID not configured');
    }
    try {
      await this.youtube.thumbnails.set({
        videoId: youtubeApiConfig.broadcastId,
        media: {
          body: fs.createReadStream(
            path.join(__dirname, config.directories.thunbnails, thumbnailUrl)
          ),
        },
      });
      logger.info(`Updated stream thumbnail to: ${thumbnailUrl}`);
    } catch (error) {
      logger.error('Failed to update stream thumbnail:', error);
      throw new YouTubeAPIError('Failed to update stream thumbnail');
    }
  }
}
