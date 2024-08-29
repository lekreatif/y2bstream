import { spawn } from 'child_process';
import { config } from '../config/config';
import logger from '../utils/logger';
import { FileProcessingError } from '../utils/errors';
import path from 'path';

export class StreamProcessor {
  private currentProcess: any;

  public async streamToYouTube(
    getNextFile: () => Promise<string>,
    streamUrl: string
  ): Promise<void> {
    const streamFile = async () => {
      const inputFile = path.join(config.directories.videos, await getNextFile());
      logger.info(`Streaming: ${inputFile}`);

      return new Promise<void>((resolve, reject) => {
        this.currentProcess = spawn('ffmpeg', [
          '-re',
          '-i',
          inputFile,
          '-c:v',
          'copy',
          '-b:v',
          '7M',
          '-maxrate',
          '7M',
          '-bufsize',
          '2M',
          '-f',
          'flv',
          streamUrl,
        ]);

        this.currentProcess.stderr.on('data', (data: any) => {
          logger.debug(`FFmpeg output: ${data.toString()}`);
        });

        this.currentProcess.on('close', (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new FileProcessingError(`FFmpeg process exited with code ${code}`));
          }
        });
      });
    };

    while (true) {
      try {
        await streamFile();
      } catch (error) {
        logger.error('Error during streaming:', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  public stopStreaming(): void {
    if (this.currentProcess) {
      this.currentProcess.kill('SIGINT');
    }
  }
}
