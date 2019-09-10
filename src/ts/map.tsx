
import * as L from 'leaflet'
import { Config } from './config.js'
import * as content from '../content.json'
import * as layers from './layers'
import * as grid from '../grid.json'
import * as legends from '../legends.json'
import '../js/leaflet-sidebar.min.js'

let overlayMaps = {} as any
let underlayMaps = {} as any
let baseMaps = {} as any
let map: L.Map
export function createMap(container: HTMLElement, config: Config) {
  
  map = L.map(container, {zoomControl: false, wheelDebounceTime: 300})
    .setView([10.8034027, -74.15481], 11)
  new L.Control.Zoom({ position: 'bottomright' }).addTo(map)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // tslint:disable-next-line:no-console
  L.geoJSON(grid as GeoJSON.GeoJsonObject, {
    style: function(feature) {
      return {color: 'blue'}
    },

    onEachFeature: function (feature, layer) {
      if (feature.properties.layers) {
        let popupText = ''
        for (let layer of keys(feature.properties.layers) as Array<keyof typeof legends>) {
          for (let layerLegend of keys(feature.properties.layers[layer]) as Array<'habitats' | 'opportunities'>) {
            popupText += legends[layer].legends[layerLegend].legend_title[config.language]
            
            // tslint:disable-next-line:no-console
            console.log(popupText)
          }
        }
        layer.bindPopup(popupText)
      }
    }
  }).addTo(map)

  // setup base maps
  for (let baseLayer of keys(layers.baseLayers)) {
    let layer = L.tileLayer.wms(process.env.GEOSERVER_URL+'/colombia_eo4_cultivar/wms?tiled=true', {
      layers: layers.baseLayers[baseLayer].wms_name,
      transparent: true,
      format: 'image/png',
      opacity: 0.6,
      attribution: content.base_layers[baseLayer].attribution[config.language]
    })
    Object.assign(baseMaps, {[baseLayer]: layer})
  }

  // setup overlays  
  for (let overlay of keys(layers.overlayLayers)) {
    let layer = L.tileLayer.wms(process.env.GEOSERVER_URL+'/colombia_eo4_cultivar/wms?tiled=true', {
      layers: layers.overlayLayers[overlay].wms_name,
      transparent: true,
      format: 'image/png',
      opacity: 0.9,
      attribution: content.overlay_layers[overlay].attribution[config.language]
    })
    Object.assign(overlayMaps, {[overlay]: layer})
  }

  // setup underlays  
  for (let underlay of keys(layers.underlayLayers)) {
    let layer = L.tileLayer.wms(process.env.GEOSERVER_URL+'/colombia_eo4_cultivar/wms?tiled=true', {
      layers: layers.underlayLayers[underlay].wms_name,
      transparent: true,
      format: 'image/png',
      opacity: 1,
      attribution: content.underlay_layers[underlay].attribution[config.language]
    })
    Object.assign(underlayMaps, {[underlay]: layer})
  }
  updateUnderlay('satellite_imagery', true) // sentinel layer on as landing page view

  return map
}

export function refreshOverlay(layer : keyof typeof layers.overlayLayers) {
  overlayMaps[layer].bringToFront()
}

export function refreshBaseLayer(layer : keyof typeof layers.baseLayers) {
  baseMaps[layer].bringToFront()
}

export function updateOverlay(layer : keyof typeof layers.overlayLayers, checked : boolean) {
  if (checked) {
    overlayMaps[layer].addTo(map)
  } else {
    map.removeLayer(overlayMaps[layer])
  }
}

export function updateUnderlay(layer : keyof typeof layers.underlayLayers, checked : boolean) {
  if (checked) {
    underlayMaps[layer].addTo(map)
  } else {
    map.removeLayer(underlayMaps[layer])
  }
}

export function updateBaseLayer(layer : keyof typeof layers.baseLayers) {
  for (let baseLayer of keys(baseMaps)) {
    map.removeLayer(baseMaps[baseLayer])
  }
  if (layer !== 'no_layer') {
    baseMaps[layer].addTo(map)
  }
}

export function removeBaselayer() {
  for (let baseLayer of keys(baseMaps)) {
    map.removeLayer(baseMaps[baseLayer])
  }
}

export const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[]
