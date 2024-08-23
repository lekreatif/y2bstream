export class FileProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export class StreamingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StreamingError';
  }
}

export class YouTubeAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}
