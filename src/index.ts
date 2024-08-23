import { FileManager } from './services/FileManager';
import { StreamProcessor } from './services/StreamProcessor';
import { YouTubeStreamer } from './services/YoutubeStreamer';
import { HealthCheck } from './services/HealthCheck';
import { Monitoring } from './services/Monitoring';
import { config } from './config/config';
import logger from './utils/logger';
import { checkNetworkSpeed } from './utils/networkSpeedTest';

let isShuttingDown = false;

async function main() {
  const fileManager = new FileManager();
  const streamProcessor = new StreamProcessor();
  const youtubeStreamer = new YouTubeStreamer();
  const healthCheck = new HealthCheck();
  const monitoring = new Monitoring();

  healthCheck.start();
  monitoring.startServer(config.monitoring.port);

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  while (!isShuttingDown) {
    try {
      // const hasAdequateSpeed = await checkNetworkSpeed(4); // Check for 4 Mbps upload speed
      // if (!hasAdequateSpeed) {
      //   logger.warn('Network speed is insufficient for streaming. Waiting before retry...');
      //   await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
      //   continue;
      // }

      await youtubeStreamer.refreshToken();

      const outputFile = fileManager.getNextOutputFile();
      logger.info(`Streaming: ${outputFile}`);

      monitoring.setStreamStatus(true);
      const streamUrl = youtubeStreamer.getStreamUrl();
      if (!streamUrl) throw new Error('YouTube stream URL not configured');
      await streamProcessor.streamToYouTube(outputFile, streamUrl);
      monitoring.setStreamStatus(false);
    } catch (error) {
      logger.error('Error during streaming:', error);
      if (error instanceof Error) {
        logger.error('Error stack:', error.stack);
      }
      monitoring.setStreamStatus(false);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  logger.info('Streaming loop ended. Shutting down...');
}

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // Perform cleanup operations here
  // For example: close database connections, stop services, etc.

  // Give ongoing operations some time to complete
  await new Promise((resolve) => setTimeout(resolve, 5000));

  logger.info('Graceful shutdown completed.');
  process.exit(0);
}

main().catch((error) => {
  logger.error('Unhandled error in main function:', error);
  process.exit(1);
});
