import speedTest from 'speedtest-net';
import logger from './logger';

export async function checkNetworkSpeed(requiredUploadSpeed: number): Promise<boolean> {
  try {
    const result = await speedTest({maxTime: 5000});
    const uploadSpeed = result.upload.bandwidth / 125000; // Convert to Mbps
    logger.info(`Current upload speed: ${uploadSpeed} Mbps`);
    return uploadSpeed >= requiredUploadSpeed;
  } catch (error) {
    logger.error('Failed to perform speed test:', error);
    return false;
  }
}
