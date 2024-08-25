import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { config } from '../config/config';
import logger from '../utils/logger';

export class FileManager {
  private files: string[] = [];
  private watcher!: chokidar.FSWatcher;

  constructor() {
    this.loadFiles();
    this.watchDirectory();
  }

  private loadFiles(): void {
    this.files = fs
      .readdirSync(config.directories.output)
      .filter((file) => file.endsWith('.mp4'))
      .map((file) => path.join(config.directories.output, file));
    logger.info(`Loaded ${this.files.length} video files`);
  }

  private watchDirectory(): void {
    this.watcher = chokidar.watch(config.directories.output, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
    });

    this.watcher
      .on('add', (filePath) => {
        if (path.extname(filePath) === '.mp4') {
          this.files.push(filePath);
          logger.info(`New file added: ${filePath}`);
        }
      })
      .on('unlink', (filePath) => {
        const index = this.files.indexOf(filePath);
        if (index > -1) {
          this.files.splice(index, 1);
          logger.info(`File removed: ${filePath}`);
        }
      });
  }

  public getNextFile(): string {
    if (this.files.length === 0) {
      throw new Error('No video files available');
    }
    const file = this.files.shift()!;
    this.files.push(file);
    return file;
  }

  public cleanup(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
