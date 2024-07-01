import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/maps-icons';
import '@polymer/paper-button/paper-button';
import '@polymer/app-layout/app-grid/app-grid-style';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';

import './etools-prp-ajax';
import '../elements/etools-prp-number';
import './status-badge';
import '../elements/etools-prp-printer';
import './disaggregations/disaggregation-table';
import './disaggregations/disaggregation-modal';
import {DisaggregationModalEl} from './disaggregations/disaggregation-modal';
import '../elements/report-status';
import './pull-modal';
import {PullModalEl} from './pull-modal';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {buttonsStyles} from '../styles/buttons-styles';
import {disaggregationsFetch} from '../../redux/actions/disaggregations';
import {currentProgrammeDocument} from '../redux/selectors/programmeDocuments';
import {RootState} from '../../typings/redux.types';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';
import {store} from '../../redux/store';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
@customElement('indicator-details')
export class IndicatorDetails extends connect(store)(LocalizeMixin(UtilsMixin(LitElement))) {
  render() {
    if (!this.dataLoaded) {
      return;
    }
    return html`
      ${buttonsStyles}
      <style include="iron-flex iron-flex-alignment app-grid-style">
        :host {
          display: block;
          width: 100%;
          min-height: 150px;
          position: relative;

          --app-grid-columns: 2;
          --app-grid-gutter: 25px;
          --app-grid-item-height: auto;

          --paper-tabs: {
            padding-left: 12px;
            border-bottom: 1px solid var(--paper-grey-300);
          }
        }

        .header {
          padding: 20px 75px 0 25px;
          position: relative;
          height: 40px;
        }

        .locations-heading {
          margin: 0;
          font-size: 12px;
        }

        .print-btn {
          position: absolute;
          right: 15px;
          top: 9px;
        }

        .tab-header {
          padding: 10px 25px;
          border-bottom: 1px solid var(--paper-grey-300);
          background: var(--paper-grey-100);
        }

        .tab-header paper-button {
          margin: 0;
        }

        .table-container {
          max-height: 500px;
          padding-bottom: 25px;
          overflow: inherit;
        }

        .table-container dl {
          margin: 0;
          font-size: 12px;
          color: var(--theme-secondary-text-color);
        }

        .table-container dt,
        .table-container dd {
          display: inline;
          margin: 0;
        }

        .table-container dt:first-of-type,
        .table-container dd:first-of-type {
          font-weight: bold;
        }

        .table-container dd::after {
          content: '\\A';
          white-space: pre;
        }

        #tabs-pages-container {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          flex-direction: row;

          height: 360px;
        }

        #tabs-list-container {
          width: 30%;
          height: inherit;
        }

        #tabs-list {
          padding: 0;
          height: 300px; /* 360px - 60px */
          overflow: auto;
        }
        #tabs-list #tab-item {
          padding-left: 10%;
          min-height: 56px;
          padding: 0px 16px;
        }

        #tabs-list #tab-item.iron-selected {
          background-color: var(--theme-secondary-color-d);
        }

        #pages-container {
          width: 70%;
          height: inherit;
        }

        #reporting-tabs-list {
          display: flex;
          justify-content: center;
          border-bottom: 1px solid #e0e0e0;
        }

        #reporting-tabs-container {
          text-align: center;
          border-bottom: none;
        }

        #page-view-container {
          height: 250px; /* 360px - 110px */
          overflow: auto;
        }

        .location {
          margin: 0;
          font-weight: bold;
        }

        .location iron-icon {
          margin-left: -3px;
          color: var(--theme-primary-color);
        }

        .current-pd {
          margin: 0;
          font-size: 12px;
          color: var(--theme-primary-text-color-medium);
        }

        .location-progress {
          margin: 0;
          white-space: nowrap;
        }

        .location-progress dt,
        .location-progress dd {
          display: inline;
          margin: 0;
        }

        .location-progress dt {
          font-weight: bold;
        }

        disaggregation-modal disaggregation-table {
          margin-top: 1em;
        }
        @media print {
          .print-styles {
            display: flex;
          }
        }
      </style>

      <etools-prp-ajax id="disaggregations" .url="${this.disaggregationsUrl}" .params="${this.params}">
      </etools-prp-ajax>

      ${this.dataLoaded
        ? html`
            <div>
              ${this.showPullDataFromHR(this.isHfIndicator, this.mode)
                ? html`
                    <div class="tab-header layout horizontal justified">
                      <div class="self-center">${this.localize('for_this_indicator')}</div>
                      <div>
                        <etools-button
                          variant="primary"
                          modal-index="${this.indicatorId}"
                          @click="${this._openPullModal}"
                          ?disabled="${this.disablePull}"
                        >
                          ${this.localize('pull_data')}
                        </etools-button>
                      </div>
                    </div>
                  `
                : ``}
            </div>

            <etools-prp-printer selector=".printme">
              <div id="tabs-pages-container">
                <div id="tabs-list-container">
                  <div class="tabs-header-container">
                    <div class="header">
                      <h3 class="locations-heading">${this.localize('data_for_locations')}</h3>

                      <etools-icon-button class="print-btn" name="icons:print"> </etools-icon-button>
                    </div>

                    <div hidden aria-hidden="true">
                      ${this.currentPd.title
                        ? html`
                            <dl class="printme" style="margin: 0;">
                              <dt style="display: inline;">
                                ${this._singularLocalized('programme_documents', this.localize)}:
                              </dt>
                              <dd style="display: inline; margin: 0;">${this.currentPd.title}</dd>
                            </dl>
                          `
                        : ``}
                      ${this.indicatorName
                        ? html`
                            <dl class="printme" style="margin: 0;">
                              <dt style="display: inline;">${this.localize('indicator')}:</dt>
                              <dd style="display: inline; margin: 0;">${this.indicatorName}</dd>
                            </dl>
                          `
                        : ``}
                      ${this.indicatorStatus
                        ? html`
                            <span class="printme" style="margin-right: .5em;"
                              >${this.localize('indicator_status')}:</span
                            >
                            <report-status
                              class="printme"
                              .status="${this.indicatorStatus}"
                              .report-type="${this.reportType}"
                            >
                            </report-status>
                          `
                        : ``}

                      <div class="printme" style="margin-bottom: 2em;"></div>
                    </div>
                  </div>

                  <paper-listbox .selected="${this.selected}" id="tabs-list">
                    ${(this.locationData || []).map(
                      (topLevelLocation: any) => html`
                        <!-- on-rendered-item-count-changed="onLocationRendered" -->
                        <paper-item id="tab-item">
                          <status-badge .type="${this._computeLocationStatus(topLevelLocation)}"></status-badge>
                          ${topLevelLocation.name}
                        </paper-item>
                      `
                    )}}
                  </paper-listbox>
                </div>

                <iron-pages .selected="${this.selected}" id="pages-container">
                  ${(this.locationData || []).map(
                    (topLevelLocation: any, topLevelLocationIndex: number) => html`
                      <div>
                        <div id="page-header-container">
                          ${this._canEnterData(this.computedMode, topLevelLocation.byEntity[0].is_locked)
                            ? html`
                                <div class="tab-header layout horizontal justified">
                                  <div class="self-center">${this.localize('enter_data_location')}</div>
                                  <div>
                                    <paper-button
                                      class="btn-primary"
                                      modal-index="${topLevelLocationIndex}"
                                      @click="${this._openModal}"
                                      raised
                                    >
                                      ${this.localize('enter_data')}
                                    </paper-button>
                                  </div>
                                </div>
                              `
                            : ``}

                          <div id="reporting-tabs-list">
                            <paper-tabs
                              .selected="${topLevelLocation.selected}"
                              hide-scroll-buttons
                              id="reporting-tabs-container"
                            >
                              ${(topLevelLocation.byEntity || []).map(
                                (location: any) =>
                                  html`<paper-tab
                                    >${this._localizeLowerCased(
                                      location.reporting_entity.title,
                                      this.localize
                                    )}</paper-tab
                                  >`
                              )}
                            </paper-tabs>
                          </div>
                        </div>

                        <iron-pages .selected="${topLevelLocation.selected}" id="page-view-container">
                          ${(topLevelLocation.byEntity || []).map(
                            (location: any) => html`
                              <div>
                                <div class="table-container app-grid">
                                  <div class="item">
                                    <div hidden aria-hidden="true">
                                      <dl class="printme">
                                        <dt style="display: inline;">${this.localize('location')}:</dt>
                                        <dd style="display: inline; margin: 0;">
                                          ${location.location.name} - ${location.reporting_entity.title}
                                        </dd>
                                      </dl>
                                    </div>

                                    <dl>
                                      ${this._equals(location.display_type, 'number')
                                        ? html` <dt>
                                              ${this.localize('location_progress_against')}
                                              ${this._localizeLowerCased(
                                                location.reporting_entity.title,
                                                this.localize
                                              )}:
                                            </dt>
                                            <dd>
                                              <etools-prp-number
                                                .value="${location.location_progress.v}"
                                              ></etools-prp-number>
                                            </dd>
                                            <dt>${this.localize('previous_location_progress')}:</dt>
                                            <dd>
                                              <etools-prp-number
                                                .value="${location.previous_location_progress.v}"
                                              ></etools-prp-number>
                                            </dd>`
                                        : html`
                                            <dt>${this.localize('location_progress')}:</dt>
                                            <dd>
                                              ${this._formatIndicatorValue(
                                                location.display_type,
                                                location.location_progress.c
                                              )}
                                            </dd>
                                            <dt>${this.localize('previous_location_progress')}:</dt>
                                            <dd>
                                              ${this._formatIndicatorValue(
                                                location.display_type,
                                                location.previous_location_progress.c
                                              )}
                                            </dd>
                                          `}
                                    </dl>
                                    <disaggregation-table
                                      class="printme print-styles"
                                      .data="${location}"
                                      .mapping="${this.disaggregations.disagg_lookup_map}"
                                      .labels="${this.disaggregations.labels}"
                                    >
                                    </disaggregation-table>
                                  </div>
                                </div>
                              </div>
                            `
                          )}
                        </iron-pages>
                        ${!this._equals(this.computedMode, 'view')
                          ? html`
                              <disaggregation-modal
                                id="modal-${topLevelLocationIndex}"
                                .reporting-period="${this.reportingPeriod}"
                                on-opened-changed="${this._updateModals}"
                              >
                                <div slot="meta" class="layout horizontal justified">
                                  <div>
                                    <h3>${this.indicatorName}</h3>
                                    <p class="location">
                                      <iron-icon icon="maps:place"></iron-icon>
                                      ${topLevelLocation.name}
                                    </p>
                                    ${this.hasPD
                                      ? html`<p class="current-pd">
                                          ${this.currentPd.agreement} | ${this.currentPd.title}
                                        </p>`
                                      : ``}
                                  </div>
                                  <div class="layout vertical end-justified">
                                    <dl class="location-progress">
                                      <dt>${this.localize('location_progress')}</dt>
                                      <dd>
                                        ${this._equals(topLevelLocation.byEntity[0].display_type, 'number')
                                          ? html`<etools-prp-number
                                              .value="${topLevelLocation.byEntity[0].location_progress.v}"
                                            ></etools-prp-number>`
                                          : html`<span
                                              >${this._formatIndicatorValue(
                                                topLevelLocation.byEntity[0].display_type,
                                                topLevelLocation.byEntity[0].location_progress.c,
                                                1
                                              )}</span
                                            >`}
                                      </dd>
                                    </dl>
                                  </div>
                                </div>
                                ${this._computeTableVisibility(this.opened, String(topLevelLocationIndex))
                                  ? html`
                                      <disaggregation-table
                                        slot="disaggregation-table"
                                        .data="${topLevelLocation.byEntity[0]}"
                                        .by-entity="${topLevelLocation.byEntity}"
                                        .mapping="${this.disaggregations.disagg_lookup_map}"
                                        .labels="${this.disaggregations.labels}"
                                        .indicator-id="${this.indicatorId}"
                                        editable="1"
                                      >
                                      </disaggregation-table>
                                    `
                                  : ``}
                              </disaggregation-modal>
                            `
                          : ``}
                      </div>
                    `
                  )}
                </iron-pages>
              </div>
            </etools-prp-printer>
          `
        : ``}

      <pull-modal
        id="pull-modal-${this.indicatorId}"
        indicator-name="${this.indicatorName}"
        .reporting-period="${this.reportingPeriod}"
        .indicator-id="${this.indicatorId}"
        .report-id="${this.reportId}"
      >
      </pull-modal>

      <etools-loading ?active="${this.loading}"></etools-loading>
    `;
  }

  @property({type: Boolean})
  dataLoaded = false;

  @property({type: Boolean})
  loading = true;

  @property({type: Number})
  indicatorId!: number;

  @property({type: Number})
  updatedIndicatorId: number | undefined;

  @property({type: String})
  indicatorName!: string;

  @property({type: String})
  indicatorStatus!: string;

  @property({type: String})
  reportType!: string;

  @property({type: Number})
  reportableId!: number;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  reportingPeriod!: string;

  @property({type: Object})
  opened!: any;

  @property({type: Number})
  selected = 0;

  @property({type: Boolean})
  initialized = false;

  @property({type: Object})
  currentPd!: any;

  @property({type: Boolean})
  hasPD!: boolean;

  @property({type: String})
  disaggregationsUrl!: string;

  @property({type: Object})
  params!: any | undefined;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  disaggregations!: any;

  @property({type: Array})
  locationData: any[] = [];

  @property({type: String})
  mode = '';

  @property({type: String})
  overrideMode = '';

  @property({type: String})
  computedMode!: string;

  @property({type: Boolean})
  reportIsQpr!: boolean;

  @property({type: String})
  reportStatus!: string;

  @property({type: Boolean})
  disablePull!: boolean;

  @property({type: Boolean})
  isHfIndicator!: boolean;

  _currentProgrammeDocument(rootState: RootState) {
    return currentProgrammeDocument(rootState);
  }

  stateChanged(state: RootState) {
    if (state) {
      this.currentPd = this._currentProgrammeDocument(state);
    }
    if (!isJsonStrMatch(state?.disaggregations?.byIndicator, this.data)) {
      this.data = state.disaggregations.byIndicator;
    }
    if (!isJsonStrMatch(state?.programmeDocumentReports?.current?.mode, this.mode)) {
      this.mode = state.programmeDocumentReports.current.mode;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('currentPd')) {
      this.hasPD = this._computeHasPD(this.currentPd);
    }
    if (changedProperties.has('reportableId')) {
      this.disaggregationsUrl = this._computeDisaggregationsUrl(String(this.reportableId));
    }
    if (changedProperties.has('indicatorId') || changedProperties.has('currentPd')) {
      this.params = this._computeParams(this.indicatorId, this.currentPd);
    }
    if (changedProperties.has('data') || changedProperties.has('indicatorId')) {
      this.disaggregations = this._computeDisaggregations(this.data, this.indicatorId);
    }
    if (changedProperties.has('disaggregations')) {
      this.locationData = this._computeLocationData(this.disaggregations.indicator_location_data);
      this.isHfIndicator = this._computeIsHfIndicator(this.disaggregations);
    }
    if (changedProperties.has('mode') || changedProperties.has('overrideMode')) {
      this.computedMode = this._computeMode(this.mode, this.overrideMode);
    }
    if (changedProperties.has('reportStatus')) {
      this.disablePull = this._computeDisablePull(this.reportStatus);
    }
  }

  _fetchData() {
    const disaggregationsThunk = (this.shadowRoot!.getElementById('disaggregations') as EtoolsPrpAjaxEl).thunk();
    // Cancel the pending request, if any
    (this.shadowRoot!.getElementById('disaggregations') as EtoolsPrpAjaxEl).abort();

    return store.dispatch(disaggregationsFetch(disaggregationsThunk, String(this.indicatorId)));
  }

  init() {
    if (this.indicatorId) {
      if (this.initialized) {
        return;
      }
      this.initialized = true;
      this._fetchData()
        // @ts-ignore
        .then(() => {
          this.dataLoaded = true;
        })
        // @ts-ignore
        .catch((_err) => {
          // TODO: error handling
        });
    }
  }

  onLocationRendered(e: CustomEvent) {
    if (this.locationData.length === e.detail.value) {
      this.loading = false;
    }
  }

  _computeDisaggregationsUrl(reportableId: string) {
    return Endpoints.indicatorReports(reportableId);
  }

  _computeParams(indicatorId: number, currentPD: any) {
    if (!currentPD) {
      return;
    }
    const params: any = {
      pks: indicatorId,
      limit: 1
    };

    if (currentPD.id !== undefined) {
      params.pd_id_for_locations = currentPD.id;
    }

    return params;
  }

  _computeDisaggregations(data: any, key: number) {
    if (!data || !key) {
      return;
    }
    const disaggregations = this._clone(data[key]);
    if (this.updatedIndicatorId && this.updatedIndicatorId === key) {
      this.checkReportIsComplete(disaggregations);
      this.updatedIndicatorId = undefined;
    }
    return disaggregations;
  }

  _computeIsHfIndicator(disaggregations: any) {
    return disaggregations !== undefined && this.reportIsQpr === true && disaggregations.is_hf_indicator === true;
  }

  showPullDataFromHR(isHfIndicator: boolean, mode: string) {
    return isHfIndicator && mode != 'view';
  }

  _computeMode(mode: string, overrideMode: string) {
    return overrideMode || mode;
  }

  _openModal(e: CustomEvent) {
    (this.shadowRoot!.querySelector('#modal-' + (e.target as any).modalIndex) as DisaggregationModalEl).open();
  }

  _openPullModal(e: CustomEvent) {
    (this.shadowRoot!.querySelector('#pull-modal-' + (e.target as any).modalIndex) as PullModalEl).open();
  }

  _updateModals(e: CustomEvent, data: any) {
    const id = (e.target as any).id;

    if (!id) {
      return;
    }

    const change: any = {};
    change[id] = data.value;

    this.opened = Object.assign({}, this.opened, change);
  }

  _computeTableVisibility(opened: any, index: string) {
    return !!opened['modal-' + index];
  }

  _computeLocationStatus(location: any) {
    return location.byEntity[0].is_complete ? 'success' : 'error';
  }

  _computeHasPD(currentPD: any) {
    return !!Object.keys(currentPD).length;
  }

  _onLocationsUpdated(e: CustomEvent) {
    e.stopPropagation();
    this._fetchData();
    this.updatedIndicatorId = this.indicatorId;
    fireEvent(this, 'refresh-report', String(this.indicatorId));
  }

  checkReportIsComplete(disaggregations: any) {
    if (!disaggregations) {
      return;
    }
    const allComplete = (disaggregations.indicator_location_data || []).every(function (location: any) {
      return location.is_complete;
    });

    if (allComplete) {
      fireEvent(this, 'report-complete', {
        indicatorId: this.updatedIndicatorId,
        reportableId: this.reportableId
      });
    }
  }

  _computeLocationData(rawLocationData: any[]) {
    const byLocation = (rawLocationData || []).reduce(function (acc, location) {
      const locationId = location.location.id;

      if (typeof acc[locationId] === 'undefined') {
        acc[locationId] = {
          name: location.location.name,
          byEntity: [],
          selected: 0
        };
      }

      acc[locationId].byEntity.push(location);
      if (acc[locationId].byEntity.length >= 2) {
        acc[locationId].selected = acc[locationId].byEntity.length - 1;
      }
      return acc;
    }, {});

    return Object.keys(byLocation)
      .map(function (key) {
        return byLocation[key];
      })
      .sort(function (a, b) {
        return b.is_master_location_data - a.is_master_location_data;
      });
  }

  _isDualReportingEnabled(entities: any[]) {
    return entities.length > 1;
  }

  _canEnterData(mode: string, isLocked: boolean) {
    return mode !== 'view' && !isLocked;
  }

  _computeDisablePull(reportStatus: string) {
    return reportStatus === 'Sub' || reportStatus === 'Acc';
  }

  _addEventListeners() {
    this._onLocationsUpdated = this._onLocationsUpdated.bind(this);
    this.addEventListener('locations-updated', this._onLocationsUpdated as any);
  }

  _removeEventListeners() {
    this.removeEventListener('locations-updated', this._onLocationsUpdated as any);
  }

  connectedCallback() {
    super.connectedCallback();

    this.opened = {};
    this.init(); //@dci function was not called ???
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}

export {IndicatorDetails as IndicatorDetailsEl};
