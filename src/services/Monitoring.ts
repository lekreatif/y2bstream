import { Gauge, Registry } from 'prom-client';
import express from 'express';
import logger from '../utils/logger';

export class Monitoring {
  private registry: Registry;
  private app: express.Application;
  private streamGauge: Gauge<string>;

  constructor() {
    this.registry = new Registry();
    this.app = express();

    this.streamGauge = new Gauge({
      name: 'youtube_stream_status',
      help: 'Status of the YouTube stream (1 for active, 0 for inactive)',
      registers: [this.registry],
    });

    this.setupMetricsEndpoint();
  }

  private setupMetricsEndpoint(): void {
    this.app.get('/metrics', async (req, res) => {
      res.set('Content-Type', this.registry.contentType);
      res.end(await this.registry.metrics());
    });
  }

  public startServer(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Monitoring server started on port ${port}`);
    });
  }

  public setStreamStatus(isActive: boolean): void {
    this.streamGauge.set(isActive ? 1 : 0);
  }
}
