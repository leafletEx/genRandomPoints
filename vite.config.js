import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    console.log(mode, '----------\r\n')
    return {
        base: mode === 'development' ? '/' : '/leaflet-gaode/',
        plugins: [vue()],
    }
})
