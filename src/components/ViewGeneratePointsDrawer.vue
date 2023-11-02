<script setup>
import {ref} from 'vue'


const viewData = ref('')
const showDrawer = ref(false)
const openDrawer = (data) => {
  viewData.value = data
  showDrawer.value = true
}

defineExpose({
  openDrawer
})
</script>

<template>
  <el-drawer v-model="showDrawer"
             size="50%"
             direction="ltr"
             :show-close="false"
             :with-header="false">
    <el-scrollbar style="height: 90vh">
      <div>
        {{ viewData }}
      </div>
    </el-scrollbar>

    <footer>
      <el-button type="primary">复制</el-button>
    </footer>
  </el-drawer>
</template>

<style scoped>

</style>
