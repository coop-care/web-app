import Vue from 'vue';
import { Stitch, StitchAppClient } from 'mongodb-stitch-browser-sdk';

declare module 'vue/types/vue' {
    // 3. Declare augmentation for Vue
    interface Vue {
        $stitch: StitchAppClient,
    }
}

const stitch = Stitch.initializeDefaultAppClient('openomaha-elgvq');

Vue.prototype.$stitch = stitch;

export { stitch }