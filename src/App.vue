<script setup>
import L from "leaflet";
import gcoord from "gcoord";
import { reactive, onMounted } from "vue";

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
          maxZoom: 23,
          minNativeZoom: 1,
          maxNativeZoom: 18,
        },
        options,
      );
      L.TileLayer.prototype.initialize.call(this, templateUrl, options);
    },
    _setZoomTransform: function (level, center, zoom) {
      center = L.latLng(
        gcoord
          .transform([center.lng, center.lat], gcoord.WGS84, gcoord.GCJ02)
          .reverse(),
      ); // 采用 gcoord 库进行纠偏
      L.TileLayer.prototype._setZoomTransform.call(this, level, center, zoom);
    },
    _getTiledPixelBounds: function (center) {
      center = L.latLng(
        gcoord
          .transform([center.lng, center.lat], gcoord.WGS84, gcoord.GCJ02)
          .reverse(),
      ); // 采用 gcoord 库进行纠偏
      return L.TileLayer.prototype._getTiledPixelBounds.call(this, center);
    },
  });
};

initGaoDeTileLayer();

// 根据类型获取高德底图
const getGaoDeLayerByType = (type) => {
  const layerOpts = {
    c6000_Layer: "lang=zh_cn&style=6&ltype=0&scl=0&size=0", // 影像底图
    c8000_Layer: "lang=zh_cn&style=8&ltype=0&scl=0&size=0", // 影像标注，路网 + 注记
    c8200_Layer: "lang=zh_cn&style=8&ltype=2&scl=0&size=0", // 影像标注，路网
    c8400_Layer: "lang=zh_cn&style=8&ltype=4&scl=0&size=0", // 影像标注，注记
    c7000_Layer: "lang=zh_cn&style=7&ltype=0&scl=0&size=0", // 电子地图，区域面 + 路网 + 注记 + 楼块
    c7100_Layer: "lang=zh_cn&style=7&ltype=1&scl=0&size=0", // 电子底图，区域面
    c7200_Layer: "lang=zh_cn&style=7&ltype=2&scl=0&size=0", // 电子标注，路网
    c7300_Layer: "lang=zh_cn&style=7&ltype=3&scl=0&size=0", // 电子底图，区域面 + 路网
    c7400_Layer: "lang=zh_cn&style=7&ltype=4&scl=0&size=0", // 电子标注，注记
    c7500_Layer: "lang=zh_cn&style=7&ltype=5&scl=0&size=0", // 电子底图，区域面 + 注记
    c7600_Layer: "lang=zh_cn&style=7&ltype=6&scl=0&size=0", // 电子标注，路网 + 注记
    c7700_Layer: "lang=zh_cn&style=7&ltype=7&scl=0&size=0", // 电子底图，区域面 + 路网 + 注记
    c7800_Layer: "lang=zh_cn&style=7&ltype=8&scl=0&size=0", // 电子底图，楼块
    c7020_Layer: "lang=zh_cn&style=7&ltype=0&scl=2&size=0", // 电子底图，区域面 + 路网 + 楼块
  };

  return new L.TileLayer.GaoDeTileLayer(layerOpts[type], {});
};

let mapObj = reactive({});
const initMap = () => {
  const map = L.map("map", {
    center: [39.87, 116.38],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
    doubleClickZoom: false,
  });

  map.addLayer(getGaoDeLayerByType("c7000_Layer"));

  Object.assign(mapObj, map);
};

onMounted(() => {
  initMap();
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
