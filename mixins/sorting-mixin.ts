import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {debounce} from '@unicef-polymer/etools-utils/src/debouncer.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/src/singleton/router';
import {store} from '@etools-apps/prp/src_ts/redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/src/equality-comparisons.util';

/**
 * @mixinFunction
 */
function SortingMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class SortingClass extends baseClass {
    _sortOrderChanged(e: CustomEvent) {
      const data = e.detail;
      const newParams = {
        ...this.queryParams,
        sort: `${data.field}.${data.direction}`
      };

      e.stopPropagation();
      if (!isJsonStrMatch(newParams, store.getState().app.routeDetails.queryParams)) {
        EtoolsRouter.updateAppLocation(
          store.getState().app.routeDetails.path,
          EtoolsRouter.encodeQueryParams(newParams)
        );
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this._sortOrderChanged = debounce(this._sortOrderChanged.bind(this), 100);
      this.addEventListener('sort-changed', this._sortOrderChanged as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('sort-changed', this._sortOrderChanged as any);
    }
  }

  return SortingClass;
}

export default SortingMixin;
