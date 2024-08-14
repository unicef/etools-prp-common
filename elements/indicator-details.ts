import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import '../elements/etools-prp-number';
import './status-badge';
import '../elements/etools-prp-printer';
import './disaggregations/disaggregation-modal';
import '../elements/report-status';
import './pull-modal';
import UtilsMixin from '../mixins/utils-mixin';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {buttonsStyles} from '../styles/buttons-styles';
import {disaggregationsFetch} from '../../redux/actions/disaggregations';
import {currentProgrammeDocument} from '../redux/selectors/programmeDocuments';
import {RootState} from '../../typings/redux.types';
import {store} from '../../redux/store';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('indicator-details')
export class IndicatorDetails extends connect(store)(UtilsMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.dataLoaded) {
      return;
    }
    return html`
      ${buttonsStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          min-height: 150px;
          position: relative;
        }

        .header {
          padding: 20px 75px 0 25px;
          position: relative;
          height: 56px;
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
          border-bottom: 1px solid var--sl-color-gray-300);
          background: var(--sl-color-gray-100);
        }

        .tab-header etools-button {
          margin: 0;
        }

        .table-container {
          max-height: 500px;
          padding: 25px;
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
          border: none;
        }
        #tabs-list #tab-item {
          padding-left: 10%;
          min-height: 56px;
          padding: 0px 16px;
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

        .location etools-icon {
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
        .justified {
          justify-content: space-between;
        }
        @media print {
          .print-styles {
            display: flex;
          }
        }
      </style>

      ${this.dataLoaded
        ? html`
            <div>
              ${this.showPullDataFromHR(this.isHfIndicator, this.mode)
                ? html`
                    <div class="tab-header layout-horizontal justified">
                      <div class="center-align">${translate('FOR_THIS_INDICATOR')}</div>
                      <div>
                        <etools-button
                          variant="primary"
                          modal-index="${this.indicatorId}"
                          @click="${this._openPullModal}"
                          ?disabled="${this.disablePull}"
                        >
                          ${translate('PULL_DATA')}
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
                      <h3 class="locations-heading">${translate('DATA_FOR_LOCATIONS')}</h3>

                      <etools-icon-button class="print-btn" name="print"> </etools-icon-button>
                    </div>

                    <div hidden aria-hidden="true">
                      ${this.currentPd.title
                        ? html`
                            <dl class="printme" style="margin: 0;">
                              <dt style="display: inline;">${this._singularLocalized('programme_documents')}:</dt>
                              <dd style="display: inline; margin: 0;">${this.currentPd.title}</dd>
                            </dl>
                          `
                        : ``}
                      ${this.indicatorName
                        ? html`
                            <dl class="printme" style="margin: 0;">
                              <dt style="display: inline;">${translate('INDICATOR')}:</dt>
                              <dd style="display: inline; margin: 0;">${this.indicatorName}</dd>
                            </dl>
                          `
                        : ``}
                      ${this.indicatorStatus
                        ? html`
                            <span class="printme" style="margin-right: .5em;">${translate('INDICATOR_STATUS')}:</span>
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

                  <sl-menu id="tabs-list">
                    ${(this.locationData || []).map(
                      (topLevelLocation: any, topLevelLocationIndex: number) => html`
                        <sl-menu-item id="tab-item" @click="${() => (this.selected = topLevelLocationIndex)}">
                          <status-badge .type="${this._computeLocationStatus(topLevelLocation)}"></status-badge>
                          ${topLevelLocation.name}
                        </sl-menu-item>
                      `
                    )}
                  </sl-menu>
                </div>

                <div id="pages-container">
                  ${(this.locationData || []).map(
                    (topLevelLocation: any, topLevelLocationIndex: number) => html`
                      <div ?hidden="${this.selected !== topLevelLocationIndex}">
                        <div id="page-header-container">
                          ${this._canEnterData(this.computedMode, topLevelLocation.byEntity[0].is_locked)
                            ? html`
                                <div class="tab-header layout-horizontal justified">
                                  <div class="center-align">${translate('ENTER_DATA_LOCATION')}</div>
                                  <div>
                                    <etools-button
                                      variant="primary"
                                      @click="${() => this._openModal(topLevelLocationIndex)}"
                                    >
                                      ${translate('ENTER_DATA')}
                                    </etools-button>
                                  </div>
                                </div>
                              `
                            : ``}

                          <div id="reporting-tabs-list">
                            <sl-tab-group
                              @sl-tab-show="${this.onSelectedTopLevelLocationTabChanged}"
                              hide-scroll-buttons
                              id="reporting-tabs-container"
                            >
                              ${(topLevelLocation.byEntity || []).map(
                                (location: any, index: number) =>
                                  html`<sl-tab
                                    slot="nav"
                                    panel="tab_${location.id}"
                                    ?active="${this.topLevelLocationSelected === `tab_${index}`}"
                                  >
                                    ${this._localizeLowerCased(location.reporting_entity.title)}
                                  </sl-tab>`
                              )}
                            </sl-tab-group>
                          </div>
                        </div>

                        <div id="page-view-container">
                          ${(topLevelLocation.byEntity || []).map(
                            (location: any, index: number) => html`
                              <div name="tab_${index}" ?hidden="${this.topLevelLocationSelected !== `tab_${index}`}">
                                <div class="table-container ">
                                  <div class="item">
                                    <div hidden aria-hidden="true">
                                      <dl class="printme">
                                        <dt style="display: inline;">${translate('LOCATION')}:</dt>
                                        <dd style="display: inline; margin: 0;">
                                          ${location.location.name} - ${location.reporting_entity.title}
                                        </dd>
                                      </dl>
                                    </div>

                                    <dl>
                                      ${this._equals(location.display_type, 'number')
                                        ? html` <dt>
                                              ${translate('LOCATION_PROGRESS_AGAINST')}
                                              ${this._localizeLowerCased(location.reporting_entity?.title)}:
                                            </dt>
                                            <dd>
                                              <etools-prp-number
                                                .value="${location.location_progress?.v}"
                                              ></etools-prp-number>
                                            </dd>
                                            <dt>${translate('PREVIOUS_LOCATION_PROGRESS')}:</dt>
                                            <dd>
                                              <etools-prp-number
                                                .value="${location.previous_location_progress?.v}"
                                              ></etools-prp-number>
                                            </dd>`
                                        : html`
                                            <dt>${translate('LOCATION_PROGRESS')}:</dt>
                                            <dd>
                                              ${this._formatIndicatorValue(
                                                location.display_type,
                                                location.location_progress?.c
                                              )}
                                            </dd>
                                            <dt>${translate('PREVIOUS_LOCATION_PROGRESS')}:</dt>
                                            <dd>
                                              ${this._formatIndicatorValue(
                                                location.display_type,
                                                location.previous_location_progress?.c
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
                        </div>
                      </div>
                    `
                  )}
                </div>
              </div>
            </etools-prp-printer>
          `
        : ``}

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
  opened = {};

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

  @property({type: String})
  topLevelLocationSelected = 'tab_0';

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
      this.loading = false;
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
    return store.dispatch(
      disaggregationsFetch(
        sendRequest({
          method: 'GET',
          endpoint: {url: this.disaggregationsUrl},
          params: this.params
        }),
        String(this.indicatorId)
      )
    );
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
          console.log('indicator-details error', _err);
          // TODO: error handling
        });
    }
  }

  onSelectedTopLevelLocationTabChanged(e: CustomEvent) {
    this.topLevelLocationSelected = e.detail.name;
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

  _openModal(index: number) {
    openDialog({
      dialog: 'disaggregation-modal',
      dialogData: {
        reportingPeriod: this.reportingPeriod,
        topLevelLocation: this.locationData[index],
        currentPd: this.currentPd,
        indicatorName: this.indicatorName,
        disaggregations: this.disaggregations,
        indicatorId: this.indicatorId
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this._onLocationsUpdated();
      }
    });
  }

  _openPullModal() {
    openDialog({
      dialog: 'pull-modal',
      dialogData: {
        indicatorName: this.indicatorName,
        reportingPeriod: this.reportingPeriod,
        indicatorId: this.indicatorId,
        reportId: this.reportId
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this._onLocationsUpdated();
      }
    });
  }

  _updateModals(e: CustomEvent, id: string) {
    if (!id) {
      return;
    }

    const change: any = {};
    change[id] = e.detail.opened;

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

  _onLocationsUpdated() {
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
}

export {IndicatorDetails as IndicatorDetailsEl};
