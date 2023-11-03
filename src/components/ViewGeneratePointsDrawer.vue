<script setup>
import { ref } from "vue";
import ClipboardJS from "clipboard";
import { ElMessage } from "element-plus";

const initClipboard = () => {
  const clipboard = new ClipboardJS(document.getElementById("clipboardBtn"));

  clipboard.on("success", (e) => {
    ElMessage.success("复制成功！");
    e.clearSelection();
  });

  clipboard.on("error", (e) => {
    // 数据存在，复制失败进行提示！
    if (e.text) ElMessage.warning("复制失败！");
    else ElMessage.warning("需要复制的数据为空！");
  });
};

const viewData = ref("");
const showDrawer = ref(false);
const openDrawer = (data) => {
  viewData.value = data;
  showDrawer.value = true;
  initClipboard();
};

defineExpose({
  openDrawer,
});
</script>

<template>
  <el-drawer
    v-model="showDrawer"
    size="50%"
    direction="ltr"
    :show-close="false"
    :with-header="false"
  >
    <el-scrollbar style="height: 90vh">
      <div>
        {{ viewData }}
      </div>
    </el-scrollbar>

    <template #footer>
      <el-row justify="end">
        <el-button
          type="success"
          id="clipboardBtn"
          :data-clipboard-text="viewData"
          >一键复制数据
        </el-button>
      </el-row>
    </template>
  </el-drawer>
</template>

<style scoped></style>
