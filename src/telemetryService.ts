// telemetryService.ts - Handles telemetry and error tracking

import * as appInsights from 'applicationinsights';

export class AppInsightsTelemetryService {
  private client: any;

  constructor(instrumentationKey?: string) {
    if (instrumentationKey && instrumentationKey.trim()) {
      try {
        appInsights.setup(instrumentationKey).start();
        this.client = appInsights.defaultClient;
        this.client.trackEvent({ name: 'ExtensionActivated' });
      } catch (error) {
        console.warn('Failed to initialize Application Insights:', error);
      }
    }
  }

  trackEvent(name: string, properties?: Record<string, string>): void {
    if (this.client) {
      this.client.trackEvent({ name, properties });
    }
  }

  trackException(error: Error, properties?: Record<string, string>): void {
    if (this.client) {
      this.client.trackException({ exception: error, properties });
    }
  }

  trackMediaEvent(event: string, mediaType: string, properties?: Record<string, string>): void {
    if (this.client) {
      const mediaProperties = {
        mediaType,
        ...properties
      };
      this.client.trackEvent({
        name: `Media${event.charAt(0).toUpperCase() + event.slice(1)}`,
        properties: mediaProperties
      });
    }
  }

  flush(): void {
    if (this.client) {
      this.client.flush();
    }
  }
}