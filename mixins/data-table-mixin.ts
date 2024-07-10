import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {property} from 'lit/decorators.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {store} from '../../redux/store';

function DataTableMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DataTableClass extends baseClass {
    @property({type: Object}) queryParams = {};
    @property({type: Boolean}) _pageNumberInitialized = false;
    @property({type: Array}) openedDetails = [];

    _pageSizeChanged(e: CustomEvent) {
      const change: any = {
        page_size: e.detail.value
      };

      if (this._pageNumberInitialized) {
        change.page = 1;
      }

      this.queryParams = {...this.queryParams, ...change};

      EtoolsRouter.updateAppLocation(
        store.getState().app.routeDetails.path,
        EtoolsRouter.encodeQueryParams(this.queryParams)
      );
    }

    _colapseExpandedDetails() {
      setTimeout(() => {
        const openedDetails = this.openedDetails || [];
        if (openedDetails.length > 0) {
          const tempList = openedDetails.slice();
          tempList.forEach((detail: any) => (detail.detailsOpened = false));
        }
      }, 100);
    }

    _pageNumberChanged(e: CustomEvent) {
      this._colapseExpandedDetails();

      this.queryParams = {...this.queryParams, page: e.detail.value};

      setTimeout(() => {
        this._pageNumberInitialized = true;
      });

      EtoolsRouter.updateAppLocation(
        store.getState().app.routeDetails.path,
        EtoolsRouter.encodeQueryParams(this.queryParams)
      );
    }
  }

  return DataTableClass;
}

export default DataTableMixin;
