import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {property} from 'lit/decorators.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {store} from '../../redux/store';

function DataTableMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DataTableClass extends baseClass {
    @property({type: Object}) queryParams = {};
    @property({type: Array}) openedDetails = [];

    // _pageSizeChanged(e: CustomEvent) {
    //   this.paginator = {...this.paginator, page_size: e.detail.value};
    //   this.queryParams = {
    //     ...this.queryParams,
    //     page_size: this.paginator.page_size,
    //     page: this.paginator.page
    //   };
    //   this.requestUpdate();

    //   EtoolsRouter.updateAppLocation(
    //     store.getState().app.routeDetails.path,
    //     EtoolsRouter.encodeQueryParams(this.queryParams)
    //   );
    // }

    _colapseExpandedDetails() {
      setTimeout(() => {
        const openedDetails = this.openedDetails || [];
        if (openedDetails.length > 0) {
          const tempList = openedDetails.slice();
          tempList.forEach((detail: any) => (detail.detailsOpened = false));
        }
      }, 100);
    }

    // _pageNumberChanged(e: CustomEvent) {
    //   this._colapseExpandedDetails();

    //   this.paginator = {...this.paginator, page: e.detail.value};
    //   this.queryParams = {...this.queryParams, page: this.paginator.page};
    //   this.requestUpdate();

    //   EtoolsRouter.updateAppLocation(
    //     store.getState().app.routeDetails.path,
    //     EtoolsRouter.encodeQueryParams(this.queryParams)
    //   );
    // }

    _paginatorChanged() {
      this.queryParams = {
        ...this.queryParams,
        page_size: this.paginator.page_size,
        page: this.paginator.page
      };

      console.log('hello', this.queryParams);
      this.requestUpdate();

      EtoolsRouter.updateAppLocation(
        store.getState().app.routeDetails.path,
        EtoolsRouter.encodeQueryParams(this.queryParams)
      );
    }
  }

  return DataTableClass;
}

export default DataTableMixin;
