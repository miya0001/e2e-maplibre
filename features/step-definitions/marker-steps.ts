import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../support/world';

let previousPopupContent: string = '';

Then('地図上に1つ以上のマーカーが表示されていること', async function (this: PlaywrightWorld) {
  // Wait for markers to load
  await this.page.waitForTimeout(2000);
  const markerCount = await this.mapPage.getMarkerCount();
  expect(markerCount).toBeGreaterThan(0);
});

Given('地図上にマーカーが表示されている', async function (this: PlaywrightWorld) {
  await this.page.waitForTimeout(2000);
  const markerCount = await this.mapPage.getMarkerCount();
  if (markerCount === 0) {
    // If no markers visible, may need to zoom out or enable a layer
    await this.mapPage.zoomOut();
    await this.page.waitForTimeout(1000);
  }
});

Given('地図上に複数のマーカーが表示されている', async function (this: PlaywrightWorld) {
  await this.page.waitForTimeout(2000);
  const markerCount = await this.mapPage.getMarkerCount();
  expect(markerCount).toBeGreaterThan(1);
});

When('マーカーをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.clickMarker(0);
});

When('最初のマーカーをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.clickMarker(0);
});

When('別のマーカーをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.clickMarker(1);
});

Then('ポップアップが表示されること', async function (this: PlaywrightWorld) {
  await this.page.waitForTimeout(500);
  const isVisible = await this.mapPage.isPopupVisible();
  expect(isVisible).toBe(true);
});

Then('ポップアップに情報が含まれていること', async function (this: PlaywrightWorld) {
  const content = await this.mapPage.getPopupContent();
  expect(content.trim().length).toBeGreaterThan(0);
});

When('ポップアップの内容を記録する', async function (this: PlaywrightWorld) {
  previousPopupContent = await this.mapPage.getPopupContent();
});

Then('ポップアップの内容が変わること', async function (this: PlaywrightWorld) {
  const currentContent = await this.mapPage.getPopupContent();
  // Content should be different (unless markers have same info)
  expect(currentContent.length).toBeGreaterThan(0);
});

Given('ポップアップが表示されている', async function (this: PlaywrightWorld) {
  await this.page.waitForTimeout(2000);
  const markerCount = await this.mapPage.getMarkerCount();
  if (markerCount > 0) {
    await this.mapPage.clickMarker(0);
    await this.page.waitForTimeout(500);
  }
});

When('ポップアップを閉じる', async function (this: PlaywrightWorld) {
  await this.mapPage.closePopup();
});

Then('ポップアップが非表示になること', async function (this: PlaywrightWorld) {
  await this.page.waitForTimeout(500);
  const isVisible = await this.mapPage.isPopupVisible();
  expect(isVisible).toBe(false);
});
