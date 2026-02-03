import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

// MapLibre GL JS types for test assertions
export interface MapCenter {
  lng: number;
  lat: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFeature {
  id?: string | number;
  type: string;
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  };
  layer: {
    id: string;
    type: string;
  };
}

export class MapPage extends BasePage {
  readonly BASE_URL = 'https://maps.yaizu-smartcity.jp/';

  // Map container selectors (adjust based on actual implementation)
  private readonly mapContainer: string = '#map, .map-container, [class*="map"]';
  private readonly searchInput: string = 'input[type="search"], input[placeholder*="検索"], .search-input, [class*="search"] input';
  private readonly searchButton: string = 'button[type="submit"], .search-button, [class*="search"] button';
  private readonly layerToggle: string = '.layer-toggle, .layer-control, [class*="layer"], button[aria-label*="レイヤー"]';
  private readonly layerPanel: string = '.layer-panel, .layer-list, [class*="layer-panel"]';
  private readonly marker: string = '.marker, .leaflet-marker-icon, [class*="marker"], .mapboxgl-marker';
  private readonly popup: string = '.popup, .leaflet-popup, .mapboxgl-popup, [class*="popup"]';
  private readonly zoomInButton: string = '.zoom-in, .leaflet-control-zoom-in, [aria-label*="ズームイン"], button[title*="拡大"]';
  private readonly zoomOutButton: string = '.zoom-out, .leaflet-control-zoom-out, [aria-label*="ズームアウト"], button[title*="縮小"]';
  private readonly currentLocationButton: string = '.current-location, .geolocate, [aria-label*="現在地"], button[title*="現在地"]';

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate(this.BASE_URL);
    await this.waitForMapLoad();
  }

  async waitForMapLoad(): Promise<void> {
    // Wait for map container to be visible
    await this.page.waitForSelector(this.mapContainer, { state: 'visible', timeout: 30000 });
    // Additional wait for map tiles to load
    await this.page.waitForTimeout(2000);
    // Close any overlay dialogs that may be blocking interactions
    await this.closeOverlayDialogs();
  }

  async closeOverlayDialogs(): Promise<void> {
    // Try to close any overlay dialogs (terms, notices, etc.)
    const dialogSelectors = [
      '.dialog-overlay button',
      '.dialog-overlay .close',
      '.modal-close',
      'button[aria-label="閉じる"]',
      '.dialog button:has-text("閉じる")',
      '.dialog button:has-text("OK")',
      '.dialog button:has-text("同意")',
      '.overlay-close',
    ];

    for (const selector of dialogSelectors) {
      try {
        const closeBtn = this.page.locator(selector).first();
        if (await closeBtn.isVisible({ timeout: 1000 })) {
          await closeBtn.click();
          await this.page.waitForTimeout(500);
        }
      } catch {
        // Ignore if not found
      }
    }

    // Also try pressing Escape to close any modals
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async isMapVisible(): Promise<boolean> {
    const map = this.page.locator(this.mapContainer).first();
    return await map.isVisible();
  }

  async getMapElement(): Promise<Locator> {
    return this.page.locator(this.mapContainer).first();
  }

  // Search functionality
  async search(query: string): Promise<void> {
    const searchInput = this.page.locator(this.searchInput).first();
    await searchInput.fill(query);

    // Try to click search button or press Enter
    const searchBtn = this.page.locator(this.searchButton).first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }

    await this.page.waitForTimeout(1000);
  }

  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator(this.searchInput).first();
    await searchInput.clear();
  }

  async isSearchInputVisible(): Promise<boolean> {
    const searchInput = this.page.locator(this.searchInput).first();
    return await searchInput.isVisible();
  }

  // Layer controls
  async openLayerPanel(): Promise<void> {
    const toggle = this.page.locator(this.layerToggle).first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await this.page.waitForTimeout(500);
    }
  }

  async isLayerPanelVisible(): Promise<boolean> {
    const panel = this.page.locator(this.layerPanel).first();
    return await panel.isVisible();
  }

  async toggleLayer(layerName: string): Promise<void> {
    await this.openLayerPanel();
    const layerCheckbox = this.page.locator(`text=${layerName}`).first();
    if (await layerCheckbox.isVisible()) {
      await layerCheckbox.click();
    }
    await this.page.waitForTimeout(500);
  }

  async getAvailableLayers(): Promise<string[]> {
    await this.openLayerPanel();
    const layers = await this.page.locator(`${this.layerPanel} label, ${this.layerPanel} [role="checkbox"]`).allTextContents();
    return layers.filter(l => l.trim().length > 0);
  }

  // Marker and popup interactions
  async clickMarker(index: number = 0): Promise<void> {
    const markers = this.page.locator(this.marker);
    const count = await markers.count();
    if (count > index) {
      await markers.nth(index).click();
      await this.page.waitForTimeout(500);
    }
  }

  async isPopupVisible(): Promise<boolean> {
    const popup = this.page.locator(this.popup).first();
    return await popup.isVisible();
  }

  async getPopupContent(): Promise<string> {
    const popup = this.page.locator(this.popup).first();
    if (await popup.isVisible()) {
      return await popup.textContent() || '';
    }
    return '';
  }

  async closePopup(): Promise<void> {
    const closeButton = this.page.locator(`${this.popup} .close, ${this.popup} button[aria-label*="閉じる"]`).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click outside the popup
      await this.page.keyboard.press('Escape');
    }
    await this.page.waitForTimeout(300);
  }

  async getMarkerCount(): Promise<number> {
    const markers = this.page.locator(this.marker);
    return await markers.count();
  }

  // Zoom controls
  async zoomIn(): Promise<void> {
    const zoomIn = this.page.locator(this.zoomInButton).first();
    if (await zoomIn.isVisible()) {
      await zoomIn.click();
      await this.page.waitForTimeout(1000);
    } else {
      // Use MapLibre API directly for more reliable zoom
      await this.zoomInViaAPI();
    }
  }

  async zoomOut(): Promise<void> {
    const zoomOut = this.page.locator(this.zoomOutButton).first();
    if (await zoomOut.isVisible()) {
      await zoomOut.click();
      await this.page.waitForTimeout(1000);
    } else {
      // Use MapLibre API directly for more reliable zoom
      await this.zoomOutViaAPI();
    }
  }

  /**
   * Zoom in using MapLibre API directly
   */
  async zoomInViaAPI(): Promise<void> {
    await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { zoomIn?: () => void }).zoomIn === 'function') {
        (map as { zoomIn: () => void }).zoomIn();
      }
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * Zoom out using MapLibre API directly
   */
  async zoomOutViaAPI(): Promise<void> {
    await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { zoomOut?: () => void }).zoomOut === 'function') {
        (map as { zoomOut: () => void }).zoomOut();
      }
    });
    await this.page.waitForTimeout(500);
  }

  // Pan/drag the map
  async panMap(deltaX: number, deltaY: number): Promise<void> {
    const map = await this.getMapElement();
    const box = await map.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      await this.page.mouse.move(centerX, centerY);
      await this.page.mouse.down();
      await this.page.mouse.move(centerX + deltaX, centerY + deltaY, { steps: 10 });
      await this.page.mouse.up();
      await this.page.waitForTimeout(500);
    }
  }

  // Double click to zoom
  async doubleClickZoom(x?: number, y?: number): Promise<void> {
    const map = await this.getMapElement();
    const box = await map.boundingBox();
    if (box) {
      const clickX = x ?? box.x + box.width / 2;
      const clickY = y ?? box.y + box.height / 2;
      await this.page.mouse.dblclick(clickX, clickY);
      await this.page.waitForTimeout(500);
    }
  }

  // Current location
  async clickCurrentLocation(): Promise<void> {
    const locBtn = this.page.locator(this.currentLocationButton).first();
    if (await locBtn.isVisible()) {
      await locBtn.click();
      await this.page.waitForTimeout(1000);
    }
  }

  // ============================================
  // MapLibre GL JS Direct Access Methods
  // ============================================

  /**
   * Get the MapLibre map instance from the page
   * Geolonia Maps exposes the map via window.geolonia.map or similar
   */
  private async getMapInstance(): Promise<boolean> {
    return await this.page.evaluate(() => {
      // Try common patterns for accessing MapLibre map instance
      const win = window as unknown as Record<string, unknown>;
      return !!(
        win.map ||
        win.geoloniaMap ||
        (win.geolonia as Record<string, unknown>)?.map ||
        document.querySelector('.maplibregl-map, .mapboxgl-map')
      );
    });
  }

  /**
   * Wait for MapLibre map to be fully loaded (style and tiles)
   */
  async waitForMapLibreLoad(): Promise<void> {
    await this.page.waitForFunction(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { isStyleLoaded?: () => boolean }).isStyleLoaded === 'function') {
        return (map as { isStyleLoaded: () => boolean }).isStyleLoaded();
      }
      // Fallback: check if map canvas exists
      return !!document.querySelector('.maplibregl-canvas, .mapboxgl-canvas');
    }, { timeout: 30000 });
  }

  /**
   * Get current zoom level from MapLibre
   */
  async getZoomLevel(): Promise<number> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getZoom?: () => number }).getZoom === 'function') {
        return (map as { getZoom: () => number }).getZoom();
      }
      return -1;
    });
  }

  /**
   * Get current map center coordinates
   */
  async getMapCenter(): Promise<MapCenter> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getCenter?: () => { lng: number; lat: number } }).getCenter === 'function') {
        const center = (map as { getCenter: () => { lng: number; lat: number } }).getCenter();
        return { lng: center.lng, lat: center.lat };
      }
      return { lng: 0, lat: 0 };
    });
  }

  /**
   * Get current map bounds
   */
  async getMapBounds(): Promise<MapBounds> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getBounds?: () => { getNorth: () => number; getSouth: () => number; getEast: () => number; getWest: () => number } }).getBounds === 'function') {
        const bounds = (map as { getBounds: () => { getNorth: () => number; getSouth: () => number; getEast: () => number; getWest: () => number } }).getBounds();
        return {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
      }
      return { north: 0, south: 0, east: 0, west: 0 };
    });
  }

  /**
   * Get all layer IDs in the map style
   */
  async getLayerIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getStyle?: () => { layers?: { id: string }[] } }).getStyle === 'function') {
        const style = (map as { getStyle: () => { layers?: { id: string }[] } }).getStyle();
        return style?.layers?.map((l: { id: string }) => l.id) || [];
      }
      return [];
    });
  }

  /**
   * Check if a specific layer is visible
   */
  async isLayerVisible(layerId: string): Promise<boolean> {
    return await this.page.evaluate((id) => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getLayoutProperty?: (id: string, prop: string) => string }).getLayoutProperty === 'function') {
        const visibility = (map as { getLayoutProperty: (id: string, prop: string) => string }).getLayoutProperty(id, 'visibility');
        return visibility !== 'none';
      }
      return false;
    }, layerId);
  }

  /**
   * Query rendered features at a point or within bounds
   */
  async queryRenderedFeatures(options?: {
    point?: { x: number; y: number };
    layers?: string[];
  }): Promise<MapFeature[]> {
    return await this.page.evaluate((opts) => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { queryRenderedFeatures?: (point?: unknown, options?: unknown) => unknown[] }).queryRenderedFeatures === 'function') {
        const queryOpts = opts?.layers ? { layers: opts.layers } : undefined;
        const point = opts?.point ? [opts.point.x, opts.point.y] : undefined;
        const features = (map as { queryRenderedFeatures: (point?: unknown, options?: unknown) => unknown[] }).queryRenderedFeatures(point, queryOpts);
        return features.slice(0, 100).map((f: unknown) => {
          const feature = f as { id?: string | number; type: string; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown }; layer: { id: string; type: string } };
          return {
            id: feature.id,
            type: feature.type,
            properties: feature.properties,
            geometry: feature.geometry,
            layer: { id: feature.layer.id, type: feature.layer.type },
          };
        });
      }
      return [];
    }, options);
  }

  /**
   * Set map zoom level directly
   */
  async setZoom(zoom: number): Promise<void> {
    await this.page.evaluate((z) => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { setZoom?: (z: number) => void }).setZoom === 'function') {
        (map as { setZoom: (z: number) => void }).setZoom(z);
      }
    }, zoom);
    await this.page.waitForTimeout(500);
  }

  /**
   * Set map center directly
   */
  async setCenter(lng: number, lat: number): Promise<void> {
    await this.page.evaluate(({ lng, lat }) => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { setCenter?: (center: [number, number]) => void }).setCenter === 'function') {
        (map as { setCenter: (center: [number, number]) => void }).setCenter([lng, lat]);
      }
    }, { lng, lat });
    await this.page.waitForTimeout(500);
  }

  /**
   * Fly to a location with animation
   */
  async flyTo(lng: number, lat: number, zoom?: number): Promise<void> {
    await this.page.evaluate(({ lng, lat, zoom }) => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { flyTo?: (opts: { center: [number, number]; zoom?: number }) => void }).flyTo === 'function') {
        const opts: { center: [number, number]; zoom?: number } = { center: [lng, lat] };
        if (zoom !== undefined) opts.zoom = zoom;
        (map as { flyTo: (opts: { center: [number, number]; zoom?: number }) => void }).flyTo(opts);
      }
    }, { lng, lat, zoom });
    await this.page.waitForTimeout(2000); // Wait for animation
  }

  /**
   * Get all source IDs in the map
   */
  async getSourceIds(): Promise<string[]> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getStyle?: () => { sources?: Record<string, unknown> } }).getStyle === 'function') {
        const style = (map as { getStyle: () => { sources?: Record<string, unknown> } }).getStyle();
        return Object.keys(style?.sources || {});
      }
      return [];
    });
  }

  /**
   * Check if map is currently moving/animating
   */
  async isMapMoving(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { isMoving?: () => boolean }).isMoving === 'function') {
        return (map as { isMoving: () => boolean }).isMoving();
      }
      return false;
    });
  }

  /**
   * Wait for map to stop moving
   */
  async waitForMapIdle(): Promise<void> {
    await this.page.waitForFunction(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { isMoving?: () => boolean }).isMoving === 'function') {
        return !(map as { isMoving: () => boolean }).isMoving();
      }
      return true;
    }, { timeout: 10000 });
  }

  /**
   * Get bearing (rotation) of the map
   */
  async getBearing(): Promise<number> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getBearing?: () => number }).getBearing === 'function') {
        return (map as { getBearing: () => number }).getBearing();
      }
      return 0;
    });
  }

  /**
   * Get pitch (tilt) of the map
   */
  async getPitch(): Promise<number> {
    return await this.page.evaluate(() => {
      const win = window as unknown as Record<string, unknown>;
      const map = win.map || win.geoloniaMap || (win.geolonia as Record<string, unknown>)?.map;
      if (map && typeof (map as { getPitch?: () => number }).getPitch === 'function') {
        return (map as { getPitch: () => number }).getPitch();
      }
      return 0;
    });
  }
}
