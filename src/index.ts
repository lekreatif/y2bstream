import { FileManager } from './services/FileManager';
import { StreamProcessor } from './services/StreamProcessor';
import { YouTubeStreamer } from './services/YoutubeStreamer';
import logger from './utils/logger';

let isShuttingDown = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    await streamProcessor.streamToYouTube(() => fileManager.getNextFile(), streamUrl);

    while (!isShuttingDown) {
      fileManager.getNextFile();
      await sleep(5000);
    }
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
