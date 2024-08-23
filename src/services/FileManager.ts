import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { config } from '../config/config';
import logger from '../utils/logger';

export class FileManager {
  private outputFiles: string[] = [];
  private watcher!: chokidar.FSWatcher;

  constructor() {
    this.loadOutputFiles();
    this.watchOutputFolder();
  }

  private loadOutputFiles(): void {
    this.outputFiles = fs.readdirSync(config.directories.output)
      .filter(file => file.endsWith('.mp4'))
      .map(file => path.join(config.directories.output, file));

    logger.info(`Loaded ${this.outputFiles.length} output files`);
  }

  private watchOutputFolder(): void {
    this.watcher = chokidar.watch(config.directories.output, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    this.watcher
      .on('add', (filePath) => {
        if (path.extname(filePath) === '.mp4') {
          logger.info(`New file detected: ${filePath}`);
          this.outputFiles.push(filePath);
        }
      })
      .on('unlink', (filePath) => {
        if (path.extname(filePath) === '.mp4') {
          logger.info(`File removed: ${filePath}`);
          this.outputFiles = this.outputFiles.filter(file => file !== filePath);
        }
      });
  }

  public getNextOutputFile(): string {
    if (this.outputFiles.length === 0) {
      throw new Error('No output files available');
    }

    const file = this.outputFiles.shift()!;
    this.outputFiles.push(file);

    return file;
  }

  public cleanup(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
