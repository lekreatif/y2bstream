import { FileManager } from './services/FileManager';
import { StreamProcessor } from './services/StreamProcessor';
import { YouTubeStreamer } from './services/YoutubeStreamer';
import logger from './utils/logger';

let isShuttingDown = false;

async function main() {
  const fileManager = new FileManager();
  const streamProcessor = new StreamProcessor();
  const youtubeStreamer = new YouTubeStreamer();

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  try {
    await youtubeStreamer.refreshToken();
    const streamUrl = youtubeStreamer.getStreamUrl();
    if (!streamUrl) throw new Error('YouTube stream URL not configured');

    // Fonction pour obtenir le prochain élément et mettre à jour le stream
    const getNextItemAndUpdateStream = async () => {
      const item = fileManager.getNextItem();
      if (item.streamTitle) {
        await youtubeStreamer.updateStreamTitle(item.streamTitle);
      }
      // if (item.coverUrl) {
      //   await youtubeStreamer.updateStreamThumbnail(item.coverUrl);
      //   logger.info(`Updated stream thumbnail to: ${item.coverUrl}`);
      // }
      return item.fileName;
    };

    // Lancer le streaming
    await streamProcessor.streamToYouTube(getNextItemAndUpdateStream, streamUrl);
  } catch (error) {
    logger.error('Unhandled error in main function:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // Perform cleanup operations here
  // For example: stop the stream processor, close file watchers, etc.

  logger.info('Graceful shutdown completed.');
  process.exit(0);
}

main().catch((error) => {
  logger.error('Unhandled error in main function:', error);
  process.exit(1);
});
