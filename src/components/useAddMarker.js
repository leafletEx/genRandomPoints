import {ref} from "vue";
import L from "leaflet";
import "leaflet.markercluster";
import {
    point as turfPoint,
    multiPolygon as turfMultiPolygon,
    booleanPointInPolygon
} from '@turf/turf'
import point_icon from "../assets/point_icon.png";
import {ElMessage} from "element-plus";

export const useAddMarker = (mapObj) => {
    const pointArr = ref([]);
    const markerList = ref([]);

    const clearAllMarker = () => {
        markerList.value.map((item) => {
            item.remove();
            return item;
        });
        markerList.value = [];
    };

    // 获取 marker icon
    const getMarkerIcon = () => {
        return L.icon({
            iconUrl: point_icon,
            iconSize: [40, 40],
        });
    };

    const markersLayerGroup = ref();
    const addMarkerToMap = () => {
        clearAllMarker()

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
                L.marker(item.reverse(), {icon: getMarkerIcon()}),
            );
        });

        // 将图层组加载到地图
        mapObj.value.addLayer(markersLayerGroup.value);
    };

    // 区域边界
    const boundaryLayer = ref()

    const clearBoundaryLayer = () => {
        if (boundaryLayer.value) {
            mapObj.value.removeLayer(boundaryLayer.value)

            boundaryLayer.value = null
        }
    }

    // 添加区域边界
    const addBoundaryLayer = (data) => {
        clearBoundaryLayer()

        boundaryLayer.value = L.geoJSON(data, {
            style: function (feature) {
                return {color: 'rgba(84,125,246, 0.4)'};
            }
        }).addTo(mapObj.value)

    }

    const areaLevelMap = {
        "province": 8,
        "city": 10,
        "district": 12,
    }

    // 将地图移动到区域中心点
    const mapMoveToAreaCenter = (areaInfo) => {
        const center = areaInfo.center
        mapObj.value.flyTo([center[1], center[0]], areaLevelMap[areaInfo.level]);
    }

    // 生成随机点
    const generateRandomPointInBoundingBox = (bbox) => {
        const [minX, minY, maxX, maxY] = bbox;
        const randomX = Math.random() * (maxX - minX) + minX;
        const randomY = Math.random() * (maxY - minY) + minY;
        return [randomX, randomY];
    }

    // 判断点是否在 geoJson 内
    const isPointInsideFeatureCollection = (featureCollection, pointCoordinates) => {

        // 将点坐标转换为 Turf.js 对象
        const point = turfPoint(pointCoordinates);

        // 遍历 FeatureCollection 中的每个 Feature
        for (const feature of featureCollection.features) {
            const multiPolygon = turfMultiPolygon(feature.geometry.coordinates);
            const isPointInsidePolygon = booleanPointInPolygon(point, multiPolygon);

            if (isPointInsidePolygon) {
                return true; // 如果点在任何一个 Feature 内，返回 true
            }
        }

        return false; // 如果点不在任何一个 Feature 内，返回 false
    }

    // 生成坐标点
    const generatePoints = async (areaInfo, num) => {
        const url = `https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=${areaInfo.adcode}_full`

        const areaData = await fetch(url).then(res => res.json())

        addBoundaryLayer(areaData)

        mapMoveToAreaCenter(areaInfo)

        pointArr.value = [];
        clearAllMarker();

        for (let i = 0; i < num; i++) {
            const point = generateRandomPointInBoundingBox(areaInfo.bbox);


            const isInside = isPointInsideFeatureCollection(areaData, point);

            if (isInside) {
                pointArr.value.push(point)
            }
        }

        console.log('生成点位数据', pointArr.value)
        ElMessage.success('生成成功，请打开控制台获取！')
        addMarkerToMap();
    };

    return {
        generatePoints,
    };
};
