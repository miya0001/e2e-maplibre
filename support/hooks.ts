import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

// Set default timeout to 60 seconds for slow page loads
setDefaultTimeout(60 * 1000);

const reportsDir = path.join(process.cwd(), 'reports');
const screenshotsDir = path.join(reportsDir, 'screenshots');

BeforeAll(async function () {
  // Ensure reports directories exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED) {
    const screenshotName = `${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const screenshotPath = path.join(screenshotsDir, `${screenshotName}.png`);

    if (this.page) {
      const screenshot = await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.attach(screenshot, 'image/png');
    }
  }

  await this.cleanup();
});

AfterAll(async function () {
  console.log('\n✅ Test execution completed. Reports available in ./reports/');
});
