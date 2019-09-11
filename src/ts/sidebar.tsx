import * as React from 'react'
import { render } from 'react-dom'
import { Config, getConfig } from './config'
import * as layers from './layers'
import * as content from '../content.json'
import * as map from './map'

const legendBaseUrl = process.env.GEOSERVER_URL+'/colombia_eo4_cultivar/wms'
  + '?REQUEST=GetLegendGraphic&FORMAT=image/png&TRANSPARENT=true&WIDTH=20'
  + '&LEGEND_OPTIONS=dx:10;my:0.5;fontName:Arial;fontSize:12;fontStyle:normal;forceLabels:on'

let sidebarLeft: L.Control.Sidebar
let sidebarRight: L.Control.Sidebar
export function createSidebar(map: L.Map, config: Config) {
  sidebarLeft = L.control.sidebar('sidebar-left', {position: 'left'})
  sidebarLeft.addTo(map)

  sidebarRight = L.control.sidebar('sidebar-right', {position: 'right'})
  
  // set up grid tab contents using react component
  ChangeGrid([])
  sidebarRight.close()
  sidebarRight.addTo(map)

  // setup home tab
  let sidebarHome: HTMLElement | null = document.getElementById('home')
  if (sidebarHome) {
    let home: HTMLElement | null = L.DomUtil.get('home')
    if (home) {
      let homeContainer = L.DomUtil.create('div', 'sidebar-home')
      homeContainer.innerHTML += '<h3><span id="close-home" class="sidebar-close">'
        + '<i class="fas fa-caret-left"></i></span></h3>'
      homeContainer.innerHTML += '<h2>'+content.info_panel.title[config.language]+'</h2>'
      for (let section of content.info_panel.info_sections) {
        if (section.section_title[config.language]) {
          homeContainer.innerHTML += '<h5>'+section.section_title[config.language]+'</h5>'
        }
        if (section.section_content[config.language]) {
          homeContainer.innerHTML += '<p>'+section.section_content[config.language]+'</p>'
        }
      }
      
      let getStartedButton = L.DomUtil.create('button', 'btn btn-primary start')
      getStartedButton.innerHTML += content.info_panel.button_text[config.language]
      getStartedButton.addEventListener('click', function() {
        sidebarLeft.open('layers')
      })
      homeContainer.appendChild(getStartedButton)

      home.appendChild(homeContainer)
    }

    // set up layers tab using react component
    let layerControls: HTMLElement | null = document.getElementById('layers')
    if (layerControls) {
      render(<LayerControls/>, layerControls)
    }
  }

  // event listeners for close buttons
  let homeClose: HTMLElement | null = document.getElementById('close-home')
  if (homeClose) {
    homeClose.addEventListener('click', function() {
      sidebarLeft.close()
    })
  }

  let layersClose: HTMLElement | null = document.getElementById('close-layers')
  if (layersClose) {
    layersClose.addEventListener('click', function() {
      sidebarLeft.close()
    })
  }

  sidebarLeft.open('home')
}

export function ChangeGrid(props: GridProps['gridLayers']) {
  let gridControls: HTMLElement | null = document.getElementById('grid')
  if (gridControls) {
    render(<GridTab gridLayers={props}/>, gridControls)
    sidebarRight.open('grid')
  }
}

export type GridProps = {
  gridLayers: Array<GridLayer>
}
export type GridLayer = {
  layerName: string,
  legends: Array<GridLegend>
}
export type GridLegend = {
  legendTitle: string,
  entries: Array<string>
}

function GridTab(props: GridProps) {
  let gridInfoText = []
  for (let section of content.grid_panel.info_sections){
    if (section.section_title) {
      gridInfoText.push(
        <h5 key={section.section_title.en} dangerouslySetInnerHTML={
          {__html: section.section_title[getConfig(window.location.search).language]}}>
        </h5>
      )
    }
    gridInfoText.push(
      <p dangerouslySetInnerHTML={
        {__html: section.section_content[getConfig(window.location.search).language]}}>
      </p>
    )
  }

  let gridLayers = []
  for (let gridLayer of props.gridLayers){
    gridLayers.push(<hr />)
    gridLayers.push(
      <h5 dangerouslySetInnerHTML={
        {__html: gridLayer.layerName}}>
      </h5>
    )
    for (let gridLegend of gridLayer.legends){
      gridLayers.push(
        <b><p dangerouslySetInnerHTML={
          {__html: gridLegend.legendTitle}}>
        </p></b>
      )
      for (let gridEntry of gridLegend.entries) {
        gridLayers.push(
          <p dangerouslySetInnerHTML={
            {__html: gridEntry}}>
          </p>
        )
      }
    }
  }

  return (
    <div>
      {gridInfoText}
      {gridLayers}
    </div>
  )
}

export class LayerControls extends React.Component {
  state = {
    hideBaseLayer: true,
    baseLayer: 'no_layer' as keyof typeof layers.baseLayers,
    overlays: {
      'zona_bananera': false
    } as any,
    underlays: {
      'satellite_imagery': true
    } as any,
    showGridLayer: false
  }

  changeBaseLayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value == 'no_layer') {
      map.removeBaselayer()
      this.setState({
        hideBaseLayer: true,
        baseLayer: event.target.value
      })
    } else {
      this.setState({
        hideBaseLayer: false,
        baseLayer: event.target.value
      })
      map.updateBaseLayer(event.target.value as keyof typeof layers.baseLayers)
      for (let overlay of keys(this.state.overlays)) {
        if (this.state.overlays[overlay]){
          map.refreshOverlay(overlay as keyof typeof layers.overlayLayers)
        }
      }
    }
  }

  changeOverlay = (event: React.ChangeEvent<HTMLInputElement>) => {
    let updatedOverlays = this.state.overlays
    updatedOverlays[event.target.value] = event.target.checked

    this.setState({
      overlays: updatedOverlays
    })
    map.updateOverlay(event.target.value as keyof typeof layers.overlayLayers, event.target.checked)
  }

  changeUnderlay = (event: React.ChangeEvent<HTMLInputElement>) => {
    let updatedUnderlays = this.state.underlays
    updatedUnderlays[event.target.value] = event.target.checked

    this.setState({
      underlays: updatedUnderlays
    })
    map.updateUnderlay(event.target.value as keyof typeof layers.underlayLayers, event.target.checked)
    map.refreshBaseLayer(this.state.baseLayer)
    for (let overlay of keys(this.state.overlays)) {
      if (this.state.overlays[overlay]){
        map.refreshOverlay(overlay as keyof typeof layers.overlayLayers)
      }
    }
  }

  changeGridLayer = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      showGridLayer: event.target.checked
    })
    map.updateGridLayer(event.target.checked)
    if (!event.target.checked) {
      sidebarRight.close()
    }
  }

  render() {
    let baseLayerOptions = []
    for (let layer of keys(layers.baseLayers)){
      baseLayerOptions.push(
        <option key={layer} value={layer}>
          {content.base_layers[layer].short_title[getConfig(window.location.search).language]}
        </option>
      )
    }

    let overlayOptions = []
    for (let layer of keys(layers.overlayLayers)) {
      overlayOptions.push(
        <div key={layer} className="checkbox">
          <div className="form-inline">
            <label className="form-check-label">
              <input id={layer+'-checkbox'} className="form-check-input" type="checkbox"
                onChange={this.changeOverlay} value={layer} checked={this.state.overlays[layer]}/>
              {content.overlay_layers[layer].short_title[getConfig(window.location.search).language]}
            </label>
          </div>
        </div>
      )
    }

    let underlayOptions = []
    for (let layer of keys(layers.underlayLayers)) {
      underlayOptions.push(
        <div key={layer} className="checkbox">
          <div className="form-inline">
            <label className="form-check-label">
              <input id={layer+'-checkbox'} className="form-check-input" type="checkbox"
                onChange={this.changeUnderlay} value={layer} checked={this.state.underlays[layer]}/>
              {content.underlay_layers[layer].short_title[getConfig(window.location.search).language]}
            </label>
          </div>
        </div>
      )
    }

    let legend = []
    if (!this.state.hideBaseLayer) {
      legend.push(
        <img key={this.state.baseLayer+'-legend'} src={
          legendBaseUrl
          +'&LAYER='
          + layers.baseLayers[this.state.baseLayer as keyof typeof layers.baseLayers].wms_name} />
      )
    }

    let info = []
    if (!this.state.hideBaseLayer) {
      for (let section of content.base_layers[this.state.baseLayer as keyof typeof content.base_layers].info_sections) {
        if (section.section_title) {
          info.push(
            <h5 dangerouslySetInnerHTML={
              {__html: section.section_title[getConfig(window.location.search).language]}}>
            </h5>
          )
        }
        info.push(
          <p dangerouslySetInnerHTML={
            {__html: section.section_content[getConfig(window.location.search).language]}}>
          </p>
        )
      }
      
    }

    return (
      <div className="sidebar-layers">
        <h3><span id="close-layers" className="sidebar-close"><i className="fas fa-caret-left"></i></span></h3>
        <div className="layer-select">
        <div key="grid" className="checkbox">
          <div className="form-inline">
            <label className="form-check-label">
              <input id="grid-checkbox" className="form-check-input" type="checkbox"
                onChange={this.changeGridLayer} value="grid" checked={this.state.showGridLayer}/>
              5k grid squares
            </label>
          </div>
        </div>
          {underlayOptions}
          {overlayOptions}
          <hr />
          <select id="baselayer-select" className="form-control" onChange={this.changeBaseLayer}>
            {baseLayerOptions}
          </select>
        </div>
        <div className="legend">
          {legend}
        </div>
        
        <div className="info">
          {info}
        </div>
      </div>
    )
  }
}

export const keys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[]
