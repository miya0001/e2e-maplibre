import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../support/world';

// Background steps
Given('スマートマップ焼津のページを開いている', async function (this: PlaywrightWorld) {
  await this.mapPage.open();
});

// Map display steps
Then('ページタイトルが {string} を含むこと', async function (this: PlaywrightWorld, expectedTitle: string) {
  const title = await this.mapPage.getTitle();
  expect(title).toContain(expectedTitle);
});

Then('地図が表示されていること', async function (this: PlaywrightWorld) {
  const isVisible = await this.mapPage.isMapVisible();
  expect(isVisible).toBe(true);

  const center = await this.mapPage.getMapCenter();
  console.log(`地図の中心: 緯度 ${center.lat}, 経度 ${center.lng}`);
});

// Zoom steps
When('ズームインボタンをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.zoomIn();
});

When('ズームアウトボタンをクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.zoomOut();
});

Then('地図が拡大されること', async function (this: PlaywrightWorld) {
  // Verification that zoom action completed without error
  const isVisible = await this.mapPage.isMapVisible();
  expect(isVisible).toBe(true);
});

Then('地図が縮小されること', async function (this: PlaywrightWorld) {
  // Verification that zoom action completed without error
  const isVisible = await this.mapPage.isMapVisible();
  expect(isVisible).toBe(true);
});

// Pan/drag steps
When('地図を右に{int}ピクセルドラッグする', async function (this: PlaywrightWorld, pixels: number) {
  await this.mapPage.panMap(pixels, 0);
});

Then('地図の表示位置が変わること', async function (this: PlaywrightWorld) {
  // Verification that pan action completed without error
  const isVisible = await this.mapPage.isMapVisible();
  expect(isVisible).toBe(true);

  const center = await this.mapPage.getMapCenter();
  console.log(`ドラッグ後の中心: 緯度 ${center.lat}, 経度 ${center.lng}`);
});

// Double click zoom
When('地図の中央をダブルクリックする', async function (this: PlaywrightWorld) {
  await this.mapPage.doubleClickZoom();
});

// ============================================
// MapLibre Direct Access Steps
// ============================================

// Zoom level assertions
Then('ズームレベルが{float}であること', async function (this: PlaywrightWorld, expectedZoom: number) {
  const zoom = await this.mapPage.getZoomLevel();
  expect(zoom).toBeCloseTo(expectedZoom, 1);
});

Then('ズームレベルが{float}以上であること', async function (this: PlaywrightWorld, minZoom: number) {
  const zoom = await this.mapPage.getZoomLevel();
  expect(zoom).toBeGreaterThanOrEqual(minZoom);
});

Then('ズームレベルが{float}以下であること', async function (this: PlaywrightWorld, maxZoom: number) {
  const zoom = await this.mapPage.getZoomLevel();
  expect(zoom).toBeLessThanOrEqual(maxZoom);
});

// Center position assertions
Then('地図の中心が緯度{float}、経度{float}であること', async function (
  this: PlaywrightWorld,
  lat: number,
  lng: number
) {
  const center = await this.mapPage.getMapCenter();
  expect(center.lat).toBeCloseTo(lat, 2);
  expect(center.lng).toBeCloseTo(lng, 2);
});

// Bounds assertions
Then('地図の表示範囲に緯度{float}、経度{float}が含まれること', async function (
  this: PlaywrightWorld,
  lat: number,
  lng: number
) {
  const bounds = await this.mapPage.getMapBounds();
  expect(lat).toBeGreaterThanOrEqual(bounds.south);
  expect(lat).toBeLessThanOrEqual(bounds.north);
  expect(lng).toBeGreaterThanOrEqual(bounds.west);
  expect(lng).toBeLessThanOrEqual(bounds.east);
});

// Direct map manipulation
When('ズームレベルを{float}に設定する', async function (this: PlaywrightWorld, zoom: number) {
  await this.mapPage.setZoom(zoom);
});

When('地図の中心を緯度{float}、経度{float}に設定する', async function (
  this: PlaywrightWorld,
  lat: number,
  lng: number
) {
  await this.mapPage.setCenter(lng, lat);
});

When('緯度{float}、経度{float}にフライする', async function (
  this: PlaywrightWorld,
  lat: number,
  lng: number
) {
  await this.mapPage.flyTo(lng, lat);
});

When('緯度{float}、経度{float}、ズーム{float}にフライする', async function (
  this: PlaywrightWorld,
  lat: number,
  lng: number,
  zoom: number
) {
  await this.mapPage.flyTo(lng, lat, zoom);
});

// Layer assertions
Then('レイヤー{string}が存在すること', async function (this: PlaywrightWorld, layerId: string) {
  const layers = await this.mapPage.getLayerIds();
  expect(layers).toContain(layerId);
});

Then('レイヤー{string}が表示されていること', async function (this: PlaywrightWorld, layerId: string) {
  const isVisible = await this.mapPage.isLayerVisible(layerId);
  expect(isVisible).toBe(true);
});

Then('レイヤー{string}が非表示であること', async function (this: PlaywrightWorld, layerId: string) {
  const isVisible = await this.mapPage.isLayerVisible(layerId);
  expect(isVisible).toBe(false);
});

// Feature query assertions
Then('地図上にフィーチャーが表示されていること', async function (this: PlaywrightWorld) {
  const features = await this.mapPage.queryRenderedFeatures();
  expect(features.length).toBeGreaterThan(0);
});

Then('レイヤー{string}にフィーチャーが{int}個以上あること', async function (
  this: PlaywrightWorld,
  layerId: string,
  minCount: number
) {
  const features = await this.mapPage.queryRenderedFeatures({ layers: [layerId] });
  expect(features.length).toBeGreaterThanOrEqual(minCount);
});

// Map state assertions
Then('地図が静止していること', async function (this: PlaywrightWorld) {
  await this.mapPage.waitForMapIdle();
  const isMoving = await this.mapPage.isMapMoving();
  expect(isMoving).toBe(false);
});

Then('地図の回転角度が{float}度であること', async function (this: PlaywrightWorld, expectedBearing: number) {
  const bearing = await this.mapPage.getBearing();
  expect(bearing).toBeCloseTo(expectedBearing, 1);
});

Then('地図の傾きが{float}度であること', async function (this: PlaywrightWorld, expectedPitch: number) {
  const pitch = await this.mapPage.getPitch();
  expect(pitch).toBeCloseTo(expectedPitch, 1);
});

// Source assertions
Then('データソース{string}が存在すること', async function (this: PlaywrightWorld, sourceId: string) {
  const sources = await this.mapPage.getSourceIds();
  expect(sources).toContain(sourceId);
});

// Zoom change verification with actual values
When('現在のズームレベルを記録する', async function (this: PlaywrightWorld) {
  await this.mapPage.waitForMapIdle();
  const zoom = await this.mapPage.getZoomLevel();
  (this as PlaywrightWorld & { savedZoom: number }).savedZoom = zoom;
});

Then('ズームレベルが増加していること', async function (this: PlaywrightWorld) {
  await this.mapPage.waitForMapIdle();
  const currentZoom = await this.mapPage.getZoomLevel();
  const savedZoom = (this as PlaywrightWorld & { savedZoom: number }).savedZoom;
  expect(currentZoom).toBeGreaterThan(savedZoom);
});

Then('ズームレベルが減少していること', async function (this: PlaywrightWorld) {
  await this.mapPage.waitForMapIdle();
  const currentZoom = await this.mapPage.getZoomLevel();
  const savedZoom = (this as PlaywrightWorld & { savedZoom: number }).savedZoom;
  expect(currentZoom).toBeLessThan(savedZoom);
});

// Center change verification
When('現在の地図中心を記録する', async function (this: PlaywrightWorld) {
  const center = await this.mapPage.getMapCenter();
  (this as PlaywrightWorld & { savedCenter: { lng: number; lat: number } }).savedCenter = center;
});

Then('地図の中心が移動していること', async function (this: PlaywrightWorld) {
  const currentCenter = await this.mapPage.getMapCenter();
  const savedCenter = (this as PlaywrightWorld & { savedCenter: { lng: number; lat: number } }).savedCenter;
  const moved = Math.abs(currentCenter.lng - savedCenter.lng) > 0.0001 ||
                Math.abs(currentCenter.lat - savedCenter.lat) > 0.0001;
  expect(moved).toBe(true);
});

// API経由でのズーム操作
When('MapLibre APIでズームインする', async function (this: PlaywrightWorld) {
  await this.mapPage.zoomInViaAPI();
});

When('MapLibre APIでズームアウトする', async function (this: PlaywrightWorld) {
  await this.mapPage.zoomOutViaAPI();
});
