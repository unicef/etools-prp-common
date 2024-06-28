import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout';
import LocalizeMixin from '../mixins/localize-mixin';

/**
 * @polymer
 * @customElement
 */
class FilterList extends LocalizeMixin(LitElement) {
  render() {
    return html`
      <style include="iron-flex">
        :host {
          background-color: #f9f9f9;
          display: block;
          position: relative;
        }

        div#action {
          @apply --layout-horizontal;
          @apply --layout-end-justified;
        }

        paper-button {
          margin: 0 10px;
          text-transform: uppercase;
        }
      </style>

      <iron-location .query="${this.query}"> </iron-location>

      <iron-query-params .params-string="${this.query}" .params-object="${this.queryParams}"> </iron-query-params>

      <slot></slot>

      ${this.hideClear
        ? ``
        : html`<div id="action">
            <paper-button on-tap="${this._clearFilters}">${this.localize('clear')}</paper-button>
          </div>`}

      <etools-loading ?active="${this.loading}"></etools-loading>
    `;
  }

  @property({type: Object})
  queryParams!: any;

  @property({type: Array})
  filters!: any[];

  @property({type: Object})
  filtersReady!: any;

  @property({type: String})
  ignore = '';

  @property({type: Array})
  ignoredFilters!: any[];

  @property({type: Boolean})
  loading = false;

  @property({type: Boolean})
  hideClear = false;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('ignore')) {
      this.ignoredFilters = this._computeIgnoredFilters(this.ignore);
    }
    if (changedProperties.has('filters') || changedProperties.has('filtersReady')) {
      this._updateLoading();
    }
  }

  _onFilterChanged(e: CustomEvent) {
    e.stopPropagation();
    const change = e.detail;
    /**
     * If we ever decide to debounce accross filters,
     * here's the place to put the logic for it.
     */

    // setTimeout is needed because without it, this.queryParams are not updated
    setTimeout(() => {
      const newParams = Object.assign({}, this.queryParams);

      if (change.value && change.value.length) {
        newParams[change.name] = change.value;
      } else {
        if (typeof newParams[change.name] !== 'undefined') {
          delete newParams[change.name];
        } else {
          // no change(nothing added or deleted), no need to set queryParams and reset pageNumber
          return;
        }
      }

      this.queryParams = newParams;

      this._resetPageNumber();
    });
  }

  _registerFilter(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    if (!name) {
      return;
    }

    if (this.ignoredFilters?.indexOf(name) !== -1) {
      return;
    }

    this.filters.push(name);
  }

  _deregisterFilter(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    const index = this.filters?.indexOf(name);

    if (index === -1) {
      return;
    }

    this.filters.splice(index, 1);
  }

  _filterReady(e: CustomEvent) {
    e.stopPropagation();
    const name = e.detail;
    if (!name) {
      return;
    }

    if (this.ignoredFilters?.indexOf(name) !== -1) {
      return;
    }

    this.filtersReady[name] = true;
    this.requestUpdate();
  }

  _clearFilters() {
    const clearParams = Object.keys(this.queryParams).reduce((prev: any, curr) => {
      if (this.filters.indexOf(curr) === -1) {
        prev[curr] = this.queryParams[curr];
      } else {
        prev[curr] = ''; // Can't set to undefined (does not trigger observers)
      }

      return prev;
    }, {});
    this.queryParams = clearParams;
    this.requestUpdate();
    this._resetPageNumber();
  }

  _resetPageNumber() {
    this.queryParams = Object.assign({}, this.queryParams, {
      page: 1
    });
  }

  _computeIgnoredFilters(ignore: string) {
    return ignore.split(',').filter(Boolean);
  }

  _updateLoading() {
    setTimeout(() => {
      const filtersCount = this.filters.length - this.ignoredFilters.length;
      const readyCount = Object.keys(this.filtersReady).length;
      this.loading = readyCount < filtersCount;
    });
  }

  _addEventListeners() {
    this._onFilterChanged = this._onFilterChanged.bind(this);
    this.addEventListener('filter-changed', this._onFilterChanged as any);
    this._registerFilter = this._registerFilter.bind(this);
    this.addEventListener('register-filter', this._registerFilter as any);
    this._filterReady = this._filterReady.bind(this);
    this.addEventListener('filter-ready', this._filterReady as any);
    this._deregisterFilter = this._deregisterFilter.bind(this);
    this.addEventListener('deregister-filter', this._deregisterFilter as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this.filters = [];
    this.filtersReady = {};
    this._addEventListeners();
  }

  _removeEventListeners() {
    this.removeEventListener('filter-changed', this._onFilterChanged as any);
    this.removeEventListener('register-filter', this._registerFilter as any);
    this.removeEventListener('filter-ready', this._filterReady as any);
    this.removeEventListener('deregister-filter', this._deregisterFilter as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}
window.customElements.define('filter-list', FilterList);

export {FilterList as FilterListEl};
