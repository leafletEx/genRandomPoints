<script setup>
import L from "leaflet";
import { onMounted, ref } from "vue";
import gcoord from "gcoord";

const emit = defineEmits(["map-load"]);
// 初始化高德地图底图
const initGaoDeTileLayer = () => {
  L.TileLayer.GaoDeTileLayer = L.TileLayer.extend({
    initialize: function (param, options) {
      const templateUrl =
        "//wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&{p}";
      // var templateUrl = "//webst{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&{p}"
      options = L.extend(
        {
          p: param,
          subdomains: "1234",
          minZoom: 0,
          maxZoom: 20,
          minNativeZoom: 1,
          maxNativeZoom: 18,
        },
        options,
      );
      L.TileLayer.prototype.initialize.call(this, templateUrl, options);
    },
    _setZoomTransform: function (level, center, zoom) {
      center = L.latLng(
        gcoord.transform([center.lat, center.lng], gcoord.WGS84, gcoord.GCJ02),
      );
      L.TileLayer.prototype._setZoomTransform.call(this, level, center, zoom);
    },
    _getTiledPixelBounds: function (center) {
      center = L.latLng(
        gcoord.transform([center.lat, center.lng], gcoord.WGS84, gcoord.GCJ02),
      );
      return L.TileLayer.prototype._getTiledPixelBounds.call(this, center);
    },
  });
};

initGaoDeTileLayer();

// 根据类型获取高德底图
const getGaoDeLayerByType = (type) => {
  const layerObj = {
    "01": { opts: "lang=zh_cn&style=6&ltype=0&scl=0&size=0", info: "影像底图" },
    "02": {
      opts: "lang=zh_cn&style=7&ltype=0&scl=0&size=0",
      info: "电子地图底图",
    },
  };

  return new L.TileLayer.GaoDeTileLayer(layerObj[type].opts, {});
};

let mapObj = ref();

const curMapLayer = ref();
const setMapLayer = (type) => {
  if (curMapLayer.value) {
    curMapLayer.value.remove(mapObj.value);
    curMapLayer.value = null;
  }

  curMapLayer.value = getGaoDeLayerByType(type);
  curMapLayer.value.addTo(mapObj.value);
};

const initMap = () => {
  // leaflet 默认投影是 L.CRS.EPSG3857	与高德相同，所以无需设置
  const map = L.map("map", {
    center: [39.865246, 116.378517],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
    doubleClickZoom: false,
  });

  mapObj.value = map;

  emit("map-load", map);
};

onMounted(() => {
  initMap();
});

defineExpose({
  setMapLayer,
});
</script>

<template>
  <div class="map" id="map"></div>
</template>

<style scoped>
.map {
  width: 100vw;
  height: 100vh;
}
</style>
