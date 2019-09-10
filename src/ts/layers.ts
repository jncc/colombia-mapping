// define the layers statically
export const baseLayers = {
  no_layer: {
    wms_name: '',
    legend_styles: []
  },
  habitat_map: {
    wms_name: 'colombia_eo4_cultivar:colombia_habitat_map_20190326_final',
    legend_styles: []
  },
  water_runoff_opportunities: {
    wms_name: 'colombia_eo4_cultivar:colombia_surface_water_regulation_stock',
    legend_styles: []
  },
  water_regulation_opportunities: {
    wms_name: 'colombia_eo4_cultivar:colombia_RioFrio_all_ops_to_enhance_surface_water_reg',
    legend_styles: []
  },
  water_regulation_opportunities_high_volume: {
    wms_name: 'colombia_eo4_cultivar:colombia_riofrio_ops_to_enhance_surface_water_reg_receiving_high_flow_volume',
    legend_styles: []
  },
  precipitation_erosion_risk: {
    wms_name: 'colombia_eo4_cultivar:colombia_precip_soil_erosion_risk',
    legend_styles: []
  },
  wind_erosion_risk: {
    wms_name: 'colombia_eo4_cultivar:colombia_soil_wind_erosion_risk',
    legend_styles: []
  },
  key_biodiversity_habitats: {
    wms_name: 'colombia_eo4_cultivar:colombia_habitat_network_sources',
    legend_styles: []
  },
  key_ecosystem_service_areas: {
    wms_name: 'colombia_eo4_cultivar:colombia_important_benefit_areas',
    legend_styles: []
  },
  woodland_ecological_connectivity: {
    wms_name: 'colombia_eo4_cultivar:colombia_woodland_ecosystem_connectivity',
    legend_styles: []
  },
  wetland_ecological_connectivity: {
    wms_name: 'colombia_eo4_cultivar:colombia_wetland_ecosystem_connectivity',
    legend_styles: []
  },
  grassland_ecological_connectivity: {
    wms_name: 'colombia_eo4_cultivar:colombia_grassland_ecosystem_connectivity',
    legend_styles: []
  },
  ecological_opportunities: {
    wms_name: 'colombia_eo4_cultivar:colombia_all_habitat_opportunities',
    legend_styles: []
  },
  priority_ecological_opportunities: {
    wms_name: 'colombia_eo4_cultivar:colombia_habitat_opportunities_next_to_existing_source_habitat',
    legend_styles: []
  },
  multi_benefit_ecological_opportunities: {
    wms_name: 'colombia_eo4_cultivar:colombia_multibenefit_opportunities_habitat_water_regulation',
    legend_styles: [
      {
        en: 'colombia_urban_mask_en',
        es: 'colombia_urban_mask_es'
      }
    ]
  }
}

export const overlayLayers = {
  zona_bananera: {
    wms_name: 'colombia_eo4_cultivar:colombia_aoi_main_catchment',
    display_legend: false,
    legend_style: {
      en: null,
      es: null
    }
  },
  rio_frio: {
    wms_name: 'colombia_eo4_cultivar:opportunities_aoi_rio_frio_catchment',
    display_legend: false,
    legend_style: {
      en: null,
      es: null
    }
  }
}

export const underlayLayers = {
  satellite_imagery: {
    wms_name: 'colombia_eo4_cultivar:satellite_imagery',
    display_legend: false
  }
}
