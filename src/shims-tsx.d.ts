import Vue, { VNode } from 'vue';
import { CombinedVueInstance } from 'vue/types/vue';

declare global {
  interface Window {
    eventBus: CombinedVueInstance<Vue, object, object, object, Record<never, any>>
  }
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
