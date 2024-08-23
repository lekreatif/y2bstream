import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from '../config/config';
import logger from '../utils/logger';
import { FileProcessingError } from '../utils/errors';

export class StreamProcessor {
  constructor() {
    // Ensure output directory exists
    if (!fs.existsSync(config.directories.output)) {
      fs.mkdirSync(config.directories.output, { recursive: true });
      logger.info(`Created output directory: ${config.directories.output}`);
    }
  }
  public async processMedia(song: string, video: string): Promise<string> {
    const outputFile = path.resolve(config.directories.output, `output_${Date.now()}.mp4`);

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i',
        path.resolve(config.directories.videos, video),
        '-i',
        path.resolve(config.directories.songs, song),
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-b:a',
        config.ffmpeg.audioBitrate,
        '-shortest',
        outputFile,
      ]);

      let ffmpegOutput = '';

      ffmpeg.stdout.on('data', (data) => {
        ffmpegOutput += data.toString();
      });

      ffmpeg.stderr.on('data', (data) => {
        ffmpegOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          logger.info(`Successfully processed: ${song} + ${video}`);
          resolve(outputFile);
        } else {
          logger.error(`FFmpeg process exited with code ${code}. Output: ${ffmpegOutput}`);
          logger.error(`Command: ffmpeg ${ffmpeg.spawnargs.join(' ')}`);
          logger.error(`Output file path: ${outputFile}`);
          logger.error(`Directory exists: ${fs.existsSync(path.dirname(outputFile))}`);
          logger.error(
            `Directory writable: ${fs.accessSync(path.dirname(outputFile), fs.constants.W_OK)}`,
          );
          reject(new FileProcessingError(`FFmpeg process exited with code ${code}`));
        }
      });
    });
  }

  public async streamToYouTube(inputFile: string, streamUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if inputFile is already an absolute path
      const fullInputPath = path.isAbsolute(inputFile) ? inputFile : path.join(config.directories.output, inputFile);

      const ffmpeg = spawn('ffmpeg', [
        '-re',
        '-i', fullInputPath,  // Use the corrected input file path
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-maxrate', '4000k',
        '-bufsize', '8000k',
        '-pix_fmt', 'yuv420p',
        '-g', '60',
        '-keyint_min', '60',
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ar', '44100',
        '-f', 'flv',
        streamUrl
      ]);

      let ffmpegOutput = '';

      ffmpeg.stdout.on('data', (data) => {
        ffmpegOutput += data.toString();
      });

      ffmpeg.stderr.on('data', (data) => {
        ffmpegOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          logger.info('Streaming process completed successfully');
          resolve();
        } else {
          logger.error(`Streaming process exited with code ${code}. Output: ${ffmpegOutput}`);
          reject(new FileProcessingError(`Streaming process exited with code ${code}`));
        }
      });
    });
  }

  public cleanupOutputFile(outputFile: string): void {
    try {
      fs.unlinkSync(outputFile);
      logger.info(`Cleaned up temporary file: ${outputFile}`);
    } catch (error) {
      logger.error(`Failed to clean up file ${outputFile}:`, error);
    }
  }
}
