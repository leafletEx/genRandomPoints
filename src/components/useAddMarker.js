import { ref } from "vue";
import L from "leaflet";

export const useAddMarker = (mapObj) => {
  const pointArr = ref([]);
  const markerList = ref([]);

  // const markerTileLayer = ref();
  // const initMarkerTileLayer = () => {
  //   markerTileLayer.value = new L.tileLayer();
  // };

  const addMarker = (point) => {
    const marker = L.marker(point).addTo(mapObj.value);
    markerList.value.push(marker);
  };

  const clearAllMarker = () => {
    markerList.value.map((item) => {
      item.remove();
      return item;
    });
    markerList.value = [];
  };

  // 生成坐标点
  const generatePoints = (areaName, num) => {
    pointArr.value = [];
    clearAllMarker();

    const bdary = new BMap.Boundary();
    //要显示的行政区域 可以是为 市 县 区
    bdary.get(areaName, function (rs) {
      //获取行政区域
      const count = rs.boundaries.length; // 行政区域的点有多少个

      if (count === 0) {
        alert("未能获取当前输入行政区域");
        return;
      }
      let lat_max = 0;
      let lat_min = 360;
      let lng_max = 0;
      let lng_min = 360;

      rs.boundaries.forEach((v) => {
        v.split(";").forEach((vv) => {
          let n = vv.split(",");
          lng_max = n[0] > lng_max ? n[0] : lng_max;
          lng_min = n[0] < lng_min ? n[0] : lng_min;

          lat_max = n[1] > lat_max ? n[1] : lat_max;
          lat_min = n[1] < lat_min ? n[1] : lat_min;
        });
      });

      const lat_range = lat_max - lat_min;
      const lng_range = lng_max - lng_min;

      // console.log(lat_max, lat_min, lat_range);
      // console.log(lng_max, lng_min, lng_range);

      // 移动到中心点
      mapObj.value.flyTo([lat_max - 2, lng_max - 2], 10);

      let pointArray = [];
      for (let i = 0; i < count; i++) {
        const ply = new BMap.Polygon(rs.boundaries[i]); //建立多边形覆盖物
        // map.addOverlay(ply); //添加覆盖物
        // console.log(ply, "====");

        pointArray = pointArray.concat(ply.getPath());
        // map.setViewport(pointArray);

        let x = 0;
        let y = 0;
        let pt = null;
        for (let i = 0; i < num; i++) {
          x = (lng_min * 100) / 100 + Math.random() * lng_range;
          y = (lat_min * 100) / 100 + Math.random() * lat_range;

          pt = new BMap.Point(x, y);
          if (BMapLib.GeoUtils.isPointInPolygon(pt, ply)) {
            const point = {
              lat: y,
              lng: x,
            };

            pointArr.value.push(point);

            addMarker(point);
          }
        }
      }
      console.log(pointArr.value);
    });
  };

  return {
    generatePoints,
  };
};
