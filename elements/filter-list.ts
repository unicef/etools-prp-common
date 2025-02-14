import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {getCurrentPath} from '../utils/util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @customElement
 */
@customElement('filter-list')
export class FilterList extends connect(store)(LitElement) {
  render() {
    return html`
      <style>
        ${layoutStyles} :host {
          background-color: #f9f9f9;
          display: block;
          position: relative;
          padding-inline-start: 15px;
          padding-inline-end: 15px;
        }

        etools-button::part(base) {
          margin: 0 15px;
          margin-bottom: 5px;
          text-transform: uppercase;
          --sl-button-font-size-medium: var(--etools-font-size-14, 14px);
          color: #212121;
        }
        etools-button::part(label) {
          font-weight: normal;
        }
      </style>

      <slot></slot>

      ${this.hideClear
        ? ``
        : html`<div id="action" class="row right-align">
            <etools-button variant="text" @click="${this._clearFilters}">${translate('CLEAR')}</etools-button>
          </div>`}

      <etools-loading ?active="${this.loading}"></etools-loading>
    `;
  }

  @property({type: Object})
  queryParams!: any;

  @property({type: Array})
  filters: any[] = [];

  @property({type: Object})
  filtersReady!: any;

  @property({type: String})
  ignore = '';

  @property({type: Array})
  ignoredFilters: any[] = [];

  @property({type: Boolean})
  loading = false;

  @property({type: Boolean})
  hideClear = false;

  @property({type: Object})
  routeDetails?: any;

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('ignore')) {
      this.ignoredFilters = this._computeIgnoredFilters(this.ignore);
    }
    if (changedProperties.has('filters') || changedProperties.has('filtersReady')) {
      this._updateLoading();
    }
    if (changedProperties.has('filters')) {
      fireEvent(this, 'filters-changed', {value: this.filters});
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
      EtoolsRouter.replaceAppLocation(getCurrentPath(), EtoolsRouter.encodeQueryParams(this.queryParams));
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

    this.filtersReady = {...this.filtersReady, [name]: true};
    this.requestUpdate();
  }

  _clearFilters() {
    const clearParams = Object.keys(this.queryParams).reduce((prev: any, curr) => {
      if (this.filters?.indexOf(curr) === -1) {
        prev[curr] = this.queryParams[curr];
      } else {
        prev[curr] = ''; // Can't set to undefined (does not trigger observers)
      }

      return prev;
    }, {});
    this.queryParams = clearParams;
    this._resetPageNumber();
    EtoolsRouter.replaceAppLocation(getCurrentPath(), EtoolsRouter.encodeQueryParams(this.queryParams));
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

export {FilterList as FilterListEl};
