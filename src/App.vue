<script setup>
import { reactive, ref, defineAsyncComponent } from "vue";
import { useGenerateRandomPointsToMap } from "./components/useGenerateRandomPointsToMap.js";
import { areaList } from "../public/area.js";
import { ElMessage } from "element-plus";

const InitMap = defineAsyncComponent(() => import("./components/InitMap.vue"));
const ViewGeneratePointsDrawer = defineAsyncComponent(() =>
  import("./components/ViewGeneratePointsDrawer.vue"),
);

let mapObj = ref();
const curMapLayerType = ref("02");
const mapLoad = (map) => {
  mapObj.value = map;
  mapRef.value.setMapLayer(curMapLayerType.value);
};

const mapRef = ref();
const setMapLayer = (type) => {
  mapRef.value.setMapLayer(type);
};

const { generatePoints, pointArr } = useGenerateRandomPointsToMap(mapObj);

const generatePointTotal = ref(1000);
const areaCode = ref("");

const areaInfo = reactive({
  adcode: "",
  center: [],
  bbox: [],
  level: "",
});

const areaTreeRef = ref();
const selChange = () => {
  if (areaCode) {
    const data = areaTreeRef.value.getCurrentNode();
    Object.assign(areaInfo, data);
  }
};

const createPoints = () => {
  if (!areaCode.value) {
    ElMessage.warning("请先选择生成随机点的区域");
    return;
  }

  generatePoints(areaInfo, generatePointTotal.value);
};

const viewGeneratePointsDrawerRef = ref();
// 查看生成的点位
const viewGeneratePoints = () => {
  if (pointArr.value.length === 0) {
    ElMessage.warning("请先点击“生成随机点”按钮生成数据！");
    return;
  }

  viewGeneratePointsDrawerRef.value.openDrawer(JSON.stringify(pointArr.value));
};
</script>

<template>
  <div class="map-box">
    <init-map ref="mapRef" @map-load="mapLoad"></init-map>

    <el-card class="operate">
      <div class="operate-body">
        <el-radio-group v-model="curMapLayerType" @change="setMapLayer">
          <el-radio-button label="01">影像地图</el-radio-button>
          <el-radio-button label="02">电子地图</el-radio-button>
        </el-radio-group>

        <el-divider></el-divider>

        <el-tree-select
          v-model="areaCode"
          ref="areaTreeRef"
          class="mb-10"
          :data="areaList"
          placeholder="请选择区域"
          node-key="adcode"
          :props="{ label: 'name' }"
          check-strictly
          @change="selChange"
        >
        </el-tree-select>

        <el-input-number
          style="width: 200px"
          class="mb-10"
          v-model="generatePointTotal"
          placeholder="请输入生成 marker 数量"
        ></el-input-number>

        <el-button-group>
          <el-button type="primary" @click="createPoints">
            生成随机点
          </el-button>
          <el-button type="primary" @click="viewGeneratePoints">
            查看数据
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <view-generate-points-drawer
      ref="viewGeneratePointsDrawerRef"
    ></view-generate-points-drawer>
  </div>
</template>

<style lang="scss" scoped>
.map-box {
  position: relative;
  width: 100vw;
  height: 100vh;

  .mb-10 {
    margin-bottom: 10px;
  }

  .operate {
    position: absolute;
    z-index: 500;
    top: 0;
    right: 0;

    .operate-body {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
</style>
<style>
.el-message {
  z-index: 99999000;
}
</style>
