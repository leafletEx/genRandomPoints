<script setup>
import L from "leaflet";
import gcoord from "gcoord";
import {onMounted, reactive, ref} from "vue";
import {useAddMarker} from "./components/useAddMarker.js";
import {areaList} from '../public/area.js'
import {ElMessage} from 'element-plus'

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
        "01": {opts: "lang=zh_cn&style=6&ltype=0&scl=0&size=0", info: "影像底图"},
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

    setMapLayer("02");
};

onMounted(() => {
    initMap();
});

const {generatePoints} = useAddMarker(mapObj);

const generatePointTotal = ref(1000);
const areaCode = ref('')

const areaInfo = reactive({
    adcode: '',
    center: [],
    bbox: [],
    level: ''
})

const areaTreeRef = ref()
const selChange = () => {
    if (areaCode) {
        const data = areaTreeRef.value.getCurrentNode()
        Object.assign(areaInfo, data)
    }
}

const createPoints = () => {
    if (!areaCode.value) {
        ElMessage.warning('请选择区域')
        return
    }

    generatePoints(areaInfo, generatePointTotal.value)
}
</script>

<template>
    <div class="map-box">
        <div class="map" id="map"></div>

        <div class="operate">
            <p @click="setMapLayer('01')">影像地图</p>
            <p @click="setMapLayer('02')">电子地图</p>

            <el-tree-select
                    v-model="areaCode"
                    ref="areaTreeRef"
                    :data="areaList"
                    placeholder="请选择区域"
                    node-key="adcode"
                    :props="{label: 'name'}"
                    check-strictly
                    @change="selChange">
            </el-tree-select>

            <el-input-number
                    style="width: 200px"
                    v-model="generatePointTotal"
                    placeholder="请输入生成 marker 数量"
            ></el-input-number>

            <p @click="createPoints">
                生成点位
            </p>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.map-box {
  position: relative;
  width: 100vw;
  height: 100vh;

  .map {
    width: 100vw;
    height: 100vh;
  }

  .operate {
    position: absolute;
    z-index: 500;
    top: 10px;
    left: 10px;
    display: flex;
    width: 100%;

    p {
      color: #ffffff;
      border-radius: 4px;
      padding: 4px 6px;
      margin: 0 10px;
      background: cadetblue;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }
    }
  }
}
</style>
<style>
.el-message {
    z-index: 99999000;
}
</style>
