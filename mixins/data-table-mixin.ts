import { LitElement, property } from 'lit';
import { Constructor, GenericObject } from '../typings/globals.types';

function DataTableMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DataTableClass extends baseClass {
    @property({ type: Object }) queryParams = {};
    @property({ type: Boolean }) _pageNumberInitialized = false;
    @property({ type: Array }) openedDetails = [];

    _pageSizeChanged(e: CustomEvent) {
      const change: GenericObject = {
        page_size: e.detail.value
      };

      if (this._pageNumberInitialized) {
        change.page = 1;
      }

      this.queryParams = { ...this.queryParams, ...change };
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

      this.queryParams = { ...this.queryParams, page: e.detail.value };

      setTimeout(() => {
        this._pageNumberInitialized = true;
      });
    }
  }
  return DataTableClass;
}

export default DataTableMixin;
