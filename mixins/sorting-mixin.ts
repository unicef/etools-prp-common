import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

/**
 * @mixinFunction
 */
function SortingMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class SortingClass extends baseClass {
    _sortOrderChanged(e: CustomEvent) {
      const data = e.detail;
      debounce(() => {
        const newParams = {
          // @ts-ignore
          ...this.queryParams,
          sort: `${data.field}.${data.direction}`
        };

        e.stopPropagation();
        // @ts-ignore
        this.queryParams = newParams;
      }, 100)();
    }

    connectedCallback() {
      super.connectedCallback();
      this._sortOrderChanged = this._sortOrderChanged.bind(this);
      // @ts-ignore
      this.addEventListener('sort-changed', this._sortOrderChanged as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      // @ts-ignore
      this.removeEventListener('sort-changed', this._sortOrderChanged as any);
      if (this._sortOrderDebouncer) {
        clearTimeout(this._sortOrderDebouncer);
      }
    }
  }

  return SortingClass;
}

export default SortingMixin;
