import { ref } from "vue";
import L from "leaflet";
import "leaflet.markercluster";
import { point as turfPoint, booleanPointInPolygon } from "@turf/turf";
import point_icon from "../assets/point_icon.png";
import { ElMessage, ElLoading } from "element-plus";
import geobuf from 'geobuf';
import Pbf from 'pbf';

const levelMap = {
  province: 'province',
  city: 'city',
  district: 'county',
}

export const useGenerateRandomPointsToMap = (mapObj) => {
  const pointArr = ref([]);

  // 获取 marker icon
  const getMarkerIcon = () => {
    return L.icon({
      iconUrl: point_icon,
      iconSize: [40, 40],
    });
  };

  const markersLayerGroup = ref();
  const addMarkerToMap = () => {
    // 图曾存在先清除
    if (markersLayerGroup.value) {
      mapObj.value.removeLayer(markersLayerGroup.value);
    }

    // 创建图层组
    markersLayerGroup.value = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
    });

    // 向图层添加数据
    pointArr.value.map((item) => {
      markersLayerGroup.value.addLayer(
        L.marker(item.reverse(), { icon: getMarkerIcon() }),
      );
    });

    // 将图层组加载到地图
    mapObj.value.addLayer(markersLayerGroup.value);
  };

  // 区域边界
  const boundaryLayer = ref();

  const clearBoundaryLayer = () => {
    if (boundaryLayer.value) {
      mapObj.value.removeLayer(boundaryLayer.value);

      boundaryLayer.value = null;
    }
  };

  // 添加区域边界
  const addBoundaryLayer = (data) => {
    clearBoundaryLayer();

    boundaryLayer.value = L.geoJSON(data, {
      style: function (feature) {
        return { color: "rgba(84,125,246, 0.4)" };
      },
    }).addTo(mapObj.value);
  };

  const areaLevelMap = {
    province: 8,
    city: 10,
    district: 12,
  };

  // 将地图移动到区域中心点
  const mapMoveToAreaCenter = (areaInfo) => {
    const center = areaInfo.center;
    mapObj.value.flyTo([center[1], center[0]], areaLevelMap[areaInfo.level]);
  };

  // 生成随机点
  const generateRandomPointInBoundingBox = (bbox) => {
    const [minX, minY, maxX, maxY] = bbox;
    const randomX = Math.random() * (maxX - minX) + minX;
    const randomY = Math.random() * (maxY - minY) + minY;
    return [randomX, randomY];
  };

  // 判断点是否在 geoJson 内
  const isPointInsideFeatureCollection = (
    featureCollection,
    pointCoordinates,
  ) => {
    // 将点坐标转换为 Turf.js 对象
    const point = turfPoint(pointCoordinates);

    const isPointInsidePolygon = booleanPointInPolygon(
      point,
      featureCollection.geometry,
    );

    return isPointInsidePolygon
  };

  // 获取区域边界
  const getAreaData = async (info) => {
    const loading = ElLoading.service({
      text: "正在生成中请稍后...",
    });

    const level = levelMap[info.level]

    const url = `https://unpkg.com/xingzhengqu@2023/data/${level}.pbf`
    const data = await fetch(url)
      .then((response) => response.arrayBuffer())
      .then((data) => geobuf.decode(new Pbf(data)));

    const list = data.features ?? []

    loading.close();

    return list.find(item => item.properties.adcode === info.adcode);
  };

  // 生成坐标点
  const generatePoints = async (areaInfo, num) => {
    pointArr.value = [];

    const areaData = await getAreaData(areaInfo);

    addBoundaryLayer(areaData);

    mapMoveToAreaCenter(areaInfo);

    // 生成指定数量的随机点
    while (pointArr.value.length < num) {
      const point = generateRandomPointInBoundingBox(areaInfo.bbox);

      const isInside = isPointInsideFeatureCollection(areaData, point);

      if (isInside) {
        pointArr.value.push(point);
      }
    }

    addMarkerToMap();

    ElMessage.success("生成成功");
  };

  return {
    pointArr,
    generatePoints,
  };
};
