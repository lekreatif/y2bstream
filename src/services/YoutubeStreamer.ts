import { google, Auth } from 'googleapis';
import { config } from '../config/config';
import logger from '../utils/logger';
import { YouTubeAPIError } from '../utils/errors';

export class YouTubeStreamer {
  private oauth2Client: Auth.OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.youtubeApi.clientId,
      config.youtubeApi.clientSecret
    );
    this.oauth2Client.setCredentials({
      refresh_token: config.youtubeApi.refreshToken
    });
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
    return config.youtubeApi.streamUrl!;
  }
}
