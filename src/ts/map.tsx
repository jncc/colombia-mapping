
import * as L from 'leaflet'
import { Config } from './config.js'
import * as content from '../content.json'
import * as layers from './layers'
import * as grid from '../grid.json'
import * as legends from '../legends.json'
import '../js/leaflet-sidebar.min.js'
import { ChangeGrid as LoadGridTab, MapLegendGroup, MapLegend, LegendEntry } from './sidebar'

let overlayMaps = {} as any
let underlayMaps = {} as any
let baseMaps = {} as any
let gridLayer = {} as any
let map: L.Map

export function createMap(container: HTMLElement, config: Config) {
  
  map = L.map(container, {zoomControl: false, wheelDebounceTime: 300})
    .setView([10.8034027, -74.15481], 11)
  new L.Control.Zoom({ position: 'bottomright' }).addTo(map)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // set up interactive grid layer
  gridLayer = L.geoJSON(grid as GeoJSON.GeoJsonObject, {
    style: function(feature) {
      return {
        color: '#5DADE2',
        weight: 2,
        fillOpacity: 0.1
      }
    },

    onEachFeature: function (feature, layer) {
      if (feature.properties.Legends && feature.properties.SourceMaps) {
        let entryIds: string[] = feature.properties.Legends.split(',').map((item: string) => item.trim())
        let mapIds: string[] = feature.properties.SourceMaps.split(',').map((item: string) => item.trim())        
        let gridLayers: Array<MapLegend> = []

        let featureLegends: Map<string, string[]> = new Map<string, string[]>()
        if (entryIds.length === mapIds.length) {
          for (let i = 0; i < entryIds.length; i++) {
            if (!featureLegends.has(mapIds[i])) {
              featureLegends.set(mapIds[i], [])
            }
            featureLegends.get(mapIds[i])!.push(entryIds[i])
          }

          let layerIds = keys(legends)
          featureLegends.forEach((values: string[], key: string) => {
            let layerId = layerIds.filter(layer => legends[layer].map_id === key)[0]
            let layer: MapLegend = {
              layerName: content.base_layers[layerId].short_title[config.language],
              legendEntries: []
            }
            gridLayers.push(layer)

            let legend = legends[layerId]
            let entries: Array<LegendEntry> = legend.legend_entries

            for (let entryId of values) {
              let entry = entries.filter(entry => entry.entry_id === entryId.toLowerCase())[0]
              if (entry) {
                layer.legendEntries.push(entry)
              }
            }
          })
        }
        
        layer.on({
          mouseover: highlightFeature,
	      	mouseout: resetHighlight,
          click: (e: L.LeafletEvent) => onGridSquareclick(e, gridLayers),
        })
      }
    }
  })

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

function highlightFeature(e: L.LeafletEvent) {
	var layer = e.target

	layer.setStyle({
    color: '#0090E1',
    weight: 5,
    fillOpacity: 0.1
	})

	if (!L.Browser.ie && !L.Browser.edge) {
		layer.bringToFront()
	}
}

function resetHighlight(e: L.LeafletEvent) {
	gridLayer.resetStyle(e.target)
}

function onGridSquareclick(e: L.LeafletEvent, gridLayers: Array<MapLegend>) {
  LoadGridTab(gridLayers)
  zoomToFeature(e)
}

function zoomToFeature(e: L.LeafletEvent) {
  map.fitBounds(e.target.getBounds(), {maxZoom: 13})
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

export function updateGridLayer(checked: boolean) {
  if (checked) {
    gridLayer.addTo(map)
  } else {
    map.removeLayer(gridLayer)
  }
}

export const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[]
