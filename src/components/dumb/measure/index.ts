import * as L from 'leaflet';

const PREFIX = 'MAP.CTRL.MEASURE.';

export default class Measure {
  // 绘制相关
  _map: L.Map;

  _layerPaint!: L.LayerGroup;

  _layerPaintPathTemp!: L.Polyline | undefined;

  _layerPaintPath!: L.Polyline | undefined;

  _lastPoint: any;

  _firstPoint: any;

  _tooltip: any;

  _distance!: number;

  // 存储地图原来的一些设置
  _doubleClickZoom: string = '';

  constructor(map: L.Map) {
    this._map = map;
  }

  startMeasuring() {
    const map: any = this._map;

    map._container.classList.add('leaflet-measure-hover');

    this._doubleClickZoom = map.doubleClickZoom.enabled();
    map.doubleClickZoom.disable();

    L.DomEvent.on(map, 'mousemove', this._mouseMove as any, this)
      .on(map, 'click', this._mouseClick as any, this)
      .on(map, 'dblclick', this._finishPath, this)
      .on(document as any, 'keydown', this._onKeyDown as any, this);

    if (!this._layerPaint) {
      this._layerPaint = L.layerGroup().addTo(map);
    }
  }

  stopMeasuring() {
    const map: any = this._map;

    map._container.classList.remove('leaflet-measure-hover');

    L.DomEvent.off(document as any, 'keydown', this._onKeyDown as any, this)
      .off(map, 'mousemove', this._mouseMove as any, this)
      .off(map, 'click', this._mouseClick as any, this)
      .off(map, 'dblclick', this._mouseClick as any, this);

    if (this._doubleClickZoom) {
      map.doubleClickZoom.enable();
    }

    if (this._layerPaint) {
      this._layerPaint.clearLayers();
    }

    this._restartPath();
  }

  _mouseMove(e: L.LeafletMouseEvent) {
    if (!e.latlng) {
      return;
    }

    if (!this._lastPoint) {
      if (!this._tooltip) {
        this._createTooltip(e.latlng);
        this._tooltip._icon.innerHTML = `
          <div
            class="leaflet-measure-tooltip-content"
            style="word-break: keep-all;white-space: nowrap;"
          >
            点击鼠标左键开始
          </div>
        `;
      }
      this._updateTooltipPosition(e.latlng);
      return;
    }

    if (!this._layerPaintPathTemp) {
      this._layerPaintPathTemp = L.polyline([this._lastPoint, e.latlng], {
        className: 'leaflet-measure-hover',
        color: '#FF6159',
        weight: 2,
        opacity: 0.3
      } as any).addTo(this._layerPaint);
      this._layerPaintPathTemp.bringToBack();
    } else {
      (this._layerPaintPathTemp as any)._latlngs = [this._lastPoint, e.latlng];
      this._layerPaintPathTemp.redraw();
    }

    if (this._tooltip) {
      if (!this._distance) {
        this._distance = 0;
      }

      this._updateTooltipPosition(e.latlng);

      const distance = e.latlng.distanceTo(this._lastPoint);
      this._updateTooltipDistance(
        this._distance + distance,
        distance,
        e.latlng,
        true
      );
    }
  }

  _mouseClick(e: L.LeafletMouseEvent) {
    // Skip if no coordinates
    if (!e.latlng) {
      return;
    }

    if (!this._firstPoint && this._tooltip) {
      this._tooltip._icon.innerHTML = `
        <div
          class="leaflet-measure-tooltip-content"
          style="word-break: keep-all;white-space: nowrap;"
        >
          起点
        </div>
      `;
      this._firstPoint = e.latlng;
    }

    // If we have a tooltip, update the distance and create a new tooltip,
    // leaving the old one exactly where it is
    // (i.e. where the user has clicked)
    if (this._lastPoint && this._tooltip) {
      this._map.fire('measureTrigger');

      if (!this._distance) {
        this._distance = 0;
      }

      this._updateTooltipPosition(e.latlng);

      const distance = e.latlng.distanceTo(this._lastPoint);
      this._updateTooltipDistance(
        this._distance + distance,
        distance,
        e.latlng,
        false
      );

      this._distance += distance;
    }
    this._createTooltip(e.latlng);

    // If this is already the second click,
    // add the location to the fix path
    // (create one first if we don't have one)
    if (this._lastPoint && !this._layerPaintPath) {
      this._layerPaintPath = L.polyline([this._lastPoint], {
        className: 'leaflet-measure-hover',
        color: '#FF6159',
        opacity: 0.8,
        weight: 2
      } as any).addTo(this._layerPaint);
      this._layerPaintPath.bringToBack();
    }

    if (this._layerPaintPath) {
      this._layerPaintPath.addLatLng(e.latlng);
    }

    new L.CircleMarker(e.latlng, {
      className: 'leaflet-measure-hover',
      color: '#FF6159',
      fill: true,
      fillColor: 'white',
      opacity: 1,
      weight: 2,
      fillOpacity: 1,
      radius: 3
    } as any).addTo(this._layerPaint);

    // Save current location as last location
    this._lastPoint = e.latlng;
  }

  _finishPath() {
    // Remove the last end marker as well as the last (moving tooltip)
    if (this._tooltip) {
      this._layerPaint.removeLayer(this._tooltip);
    }
    if (this._layerPaint && this._layerPaintPathTemp) {
      this._layerPaint.removeLayer(this._layerPaintPathTemp);
    }

    // Reset everything
    this._restartPath();
  }

  _restartPath() {
    this._distance = 0;
    this._tooltip = undefined;
    this._lastPoint = undefined;
    this._layerPaintPath = undefined;
    this._layerPaintPathTemp = undefined;
    this._firstPoint = undefined;
  }

  _createTooltip(position: L.LatLng) {
    const icon = L.divIcon({
      className: 'leaflet-measure-tooltip',
      iconAnchor: [-5, -5]
    });
    this._tooltip = L.marker(position, {
      icon,
      clickable: false
    } as any).addTo(this._layerPaint);

    L.DomEvent.on(this._tooltip._icon, 'click', (event) => {
      L.DomEvent.stopPropagation(event);
    });
  }

  _updateTooltipPosition(position: L.LatLng) {
    this._tooltip.setLatLng(position);
  }

  _updateTooltipDistance(
    total: number,
    curDis: number,
    latlng: L.LatLng,
    moving: boolean
  ) {
    let helpHtml = '';
    if (moving) {
      helpHtml = `
        <div>点击确定，Alt或Option键退出，Alt+Alt或Option+Option键结束</div>
      `;
    }

    this._tooltip._icon.innerHTML = `
      <div class="leaflet-measure-tooltip-content">
        <div class="leaflet-measure-tooltip-content-pair">
          总长: ${this._round(total)}
        </div>
        <div class="leaflet-measure-tooltip-content-pair">
          (叠加量): ${this._round(curDis)}
        </div>
        <div class="leaflet-measure-tooltip-help">
          ${helpHtml}
        </div>
      </div>
    `;
  }

  _round(val: number) {
    if (val > 1000) {
      return `${(val / 1000).toFixed(1)}千米`;
    }
    return `${val.toFixed(0)}米`;
  }

  _onKeyDown(e: L.LeafletMouseEvent) {
    if ((e as any).keyCode === 18) {
      // If not in path exit measuring mode, else just finish path
      if (!this._lastPoint) {
        this._map.fire('customMeasureStatus', { measure: false });
        this.stopMeasuring();
      } else {
        this._finishPath();
      }
    }
  }
}
