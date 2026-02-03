import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { MapPage } from '../pages/MapPage';

export interface CustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  mapPage: MapPage;
}

export class PlaywrightWorld extends World implements CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  mapPage!: MapPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    const headless = process.env.HEADLESS !== 'false';
    const slowMo = process.env.DEBUG === 'true' ? 100 : 0;

    this.browser = await chromium.launch({
      headless,
      slowMo,
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ja-JP',
      geolocation: { latitude: 34.8671, longitude: 138.3245 }, // Yaizu city coordinates
      permissions: ['geolocation'],
    });

    this.page = await this.context.newPage();
    this.mapPage = new MapPage(this.page);
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(PlaywrightWorld);
