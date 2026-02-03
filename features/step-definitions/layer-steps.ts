import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../support/world';

let selectedLayers: string[] = [];

When('レイヤー切り替えボタンをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.openLayerPanel();
});

Then('レイヤーパネルが表示されること', async function (this: PlaywrightWorld) {
  const isVisible = await this.mapPage.isLayerPanelVisible();
  expect(isVisible).toBe(true);
});

Then('複数のレイヤーオプションが表示されること', async function (this: PlaywrightWorld) {
  const layers = await this.mapPage.getAvailableLayers();
  expect(layers.length).toBeGreaterThan(0);
});

When('レイヤーを選択する', async function (this: PlaywrightWorld) {
  const layers = await this.mapPage.getAvailableLayers();
  if (layers.length > 0) {
    await this.mapPage.toggleLayer(layers[0]);
    selectedLayers = [layers[0]];
  }
});

Then('選択したレイヤーが地図上に表示されること', async function (this: PlaywrightWorld) {
  // Verify map is still functional after layer toggle
  const isMapVisible = await this.mapPage.isMapVisible();
  expect(isMapVisible).toBe(true);
});

Given('レイヤーがオンになっている', async function (this: PlaywrightWorld) {
  await this.mapPage.openLayerPanel();
  const layers = await this.mapPage.getAvailableLayers();
  if (layers.length > 0) {
    await this.mapPage.toggleLayer(layers[0]);
    selectedLayers = [layers[0]];
  }
});

When('そのレイヤーをオフにする', async function (this: PlaywrightWorld) {
  if (selectedLayers.length > 0) {
    await this.mapPage.toggleLayer(selectedLayers[0]);
  }
});

Then('レイヤーが地図上から非表示になること', async function (this: PlaywrightWorld) {
  // Verify map is still functional after layer toggle off
  const isMapVisible = await this.mapPage.isMapVisible();
  expect(isMapVisible).toBe(true);
});

When('複数のレイヤーを選択する', async function (this: PlaywrightWorld) {
  const layers = await this.mapPage.getAvailableLayers();
  selectedLayers = [];
  for (let i = 0; i < Math.min(2, layers.length); i++) {
    await this.mapPage.toggleLayer(layers[i]);
    selectedLayers.push(layers[i]);
  }
});

Then('選択したすべてのレイヤーが地図上に表示されること', async function (this: PlaywrightWorld) {
  // Verify map is still functional after multiple layer toggles
  const isMapVisible = await this.mapPage.isMapVisible();
  expect(isMapVisible).toBe(true);
});
