import express from 'express';
import { config } from '../config/config';
import logger from '../utils/logger';

export class HealthCheck {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupHealthCheckEndpoint();
  }

  private setupHealthCheckEndpoint(): void {
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });

    // Catch-all for other routes
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });
  }

  public start(): void {
    this.server = this.app.listen(config.healthCheck.port, () => {
      logger.info(`Health check server running on port ${config.healthCheck.port}`);
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close(() => {
        logger.info('Health check server stopped');
      });
    }
  }
}
