import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {property, state} from 'lit/decorators.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {store} from '../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

function DataTableMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DataTableClass extends baseClass {
    @property({type: Object}) queryParams = {};
    @property({type: Array}) openedDetails = [];

    @state() _localPaginator = null;

    _colapseExpandedDetails() {
      setTimeout(() => {
        const openedDetails = this.openedDetails || [];
        if (openedDetails.length > 0) {
          const tempList = openedDetails.slice();
          tempList.forEach((detail: any) => (detail.detailsOpened = false));
        }
      }, 100);
    }

    _paginatorChanged() {
      if (this.paginator && !isJsonStrMatch(this._localPaginator, this.paginator)) {
        this._localPaginator = {...this.paginator};

        this.queryParams = {
          ...(store.getState().app.routeDetails.queryParams || {}),
          page_size: this.paginator.page_size,
          page: this.paginator.page
        };

        if (!isJsonStrMatch(this.queryParams, store.getState().app.routeDetails.queryParams)) {
          EtoolsRouter.updateAppLocation(
            store.getState().app.routeDetails.path,
            EtoolsRouter.encodeQueryParams(this.queryParams)
          );
        }
      }
    }
  }

  return DataTableClass;
}

export default DataTableMixin;
