import {LitElement} from 'lit';
import {property, state} from 'lit/decorators.js';
import {Constructor} from '../typings/globals.types';

/**
 * @mixinFunction
 */
function PaginationMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class PaginationClass extends baseClass {
    @property({type: Object})
    queryParams!: any;

    @state()
    pageSize!: number;

    @state()
    pageNumber!: number;

    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('queryParams')) {
        this.pageSize = this._computePageSize(this.queryParams);
        this.pageNumber = this._computePageNumber(this.queryParams);
      }
      if (changedProperties.has('pageSize') || changedProperties.has('pageNumber')) {
        this._updateQueryParams(this.pageSize, this.pageNumber);
      }
    }

    _computePageSize(queryParams: any) {
      return Number(queryParams.page_size || 10);
    }

    _computePageNumber(queryParams: any) {
      return Number(queryParams.page || 1);
    }

    _updateQueryParams(pageSize: number, pageNumber: number) {
      const newParams = {
        ...this.queryParams,
        page_size: pageSize,
        page: pageNumber
      };
      setTimeout(() => {
        this.queryParams = newParams;
      });
    }

    _detailsChange(event: CustomEvent) {
      // @ts-ignore
      if (!this.openedDetails) {
        return;
      }
      const element = event.detail.row;
      if (event.detail.detailsOpened) {
        // @ts-ignore
        this.openedDetails.push(element);
      } else {
        // @ts-ignore
        const index = this.openedDetails.indexOf(element);
        if (index !== -1) {
          // @ts-ignore
          this.openedDetails.splice(index, 1);
        }
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
    }
  }

  return PaginationClass;
}

export default PaginationMixin;
