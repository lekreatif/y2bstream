import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { config } from '../config/config';
import logger from '../utils/logger';

interface VideoItem {
  videoPath: string;
  streamTitle?: string;
  coverUrl?: string;
}

export class FileManager {
  private queue: VideoItem[] = [];
  private watcher!: chokidar.FSWatcher;
  private queueFile: string;

  constructor() {
    this.queueFile = path.join(config.directories.output, 'queue.json');
    this.loadQueue();
    this.watchQueue();
  }

  private loadQueue(): void {
    try {
      const data = fs.readFileSync(this.queueFile, 'utf8');
      this.queue = JSON.parse(data);
      logger.info(`Loaded ${this.queue.length} video items from queue.json`);
    } catch (error) {
      logger.error('Failed to load queue.json:', error);
      this.queue = [];
    }
  }

  private watchQueue(): void {
    this.watcher = chokidar.watch(this.queueFile, {
      persistent: true,
    });

    this.watcher
      .on('error', (error) => console.error(`Watcher error: ${error}`))
      .on('ready', () => logger.info('Initial scan complete. Ready for changes.'))
      .on('change', () => {
        logger.info('queue.json has changed. Reloading queue...');
        this.loadQueue();
      });
  }

  public getNextItem(): VideoItem {
    if (this.queue.length === 0) {
      throw new Error('No video items available');
    }
    const item = this.queue.shift()!;
    this.queue.push(item);
    return item;
  }

  public cleanup(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
