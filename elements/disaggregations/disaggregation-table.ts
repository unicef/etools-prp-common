import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-input/paper-input';
import './table-content/three-disaggregations';
import './table-content/two-disaggregations';
import './table-content/one-disaggregation';
import './table-content/zero-disaggregations';
import './disaggregation-switches';
import '../etools-prp-ajax';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DisaggregationHelpersMixin from '../../mixins/disaggregation-helpers-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';
import Endpoints from '../../endpoints';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {disaggregationsUpdateForLocation} from '../../../redux/actions/disaggregations';
import {EtoolsPrpAjaxEl} from '../etools-prp-ajax';
import { store } from '../../../redux/store';
import { RootState } from '../../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationHelpersMixin
 */
class DisaggregationTable extends connect(store)(LocalizeMixin(DisaggregationHelpersMixin(UtilsMixin(LitElement)))) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          --paper-input-container: {
            padding: 0;
          }
        }

        disaggregation-switches {
          margin-bottom: 1em;
        }

        .data-key {
          font-size: 12px;
          color: var(--theme-secondary-text-color);
        }

        .data-key dt,
        .data-key dd {
          display: inline;
        }

        .data-key dd {
          margin: 0;
        }

        h4 {
          font-size: 12px;
        }

        .percentage-map {
          padding-left: 25px;
        }

        .percentage-map ul {
          padding: 0;
          margin: 0;
          list-style: none;
          font-size: 13px;
        }

        .percentage-map li {
          margin-bottom: 5px;
        }

        .percentage-map paper-input {
          width: 60px;
          padding: 0;
          margin: 0 5px;
          text-align: center;
        }

        .percentage-map .entity-name {
          display: inline-block;
          padding: 3px 10px;
          white-space: nowrap;
          background-color: var(--paper-grey-100);
        }
      </style>

      <etools-prp-ajax
        id="update"
        .url="${this.updateUrl}"
        .body="${this.localData}"
        content-type="application/json"
        method="put"
      >
      </etools-prp-ajax>

      <div>
        <disaggregation-switches
          .data="${this.data}"
          .mapping="${this.mapping}"
          ?editable="${this.editable}"
          .formatted-data="${this.formattedData}"
          on-formatted-data-changed="${this._triggerModalRefit}"
        >
        </disaggregation-switches>

        ${this.viewLabel && this.labels ? html`<dl class="data-key">
              <dt>${this.localize('label')} -</dt>
              ${this._equals(this.data.display_type, 'number') ? 
                html`<dd>${this._withDefault(this.labels.label)}</dd>`: 
                html`<dd>${this._withDefault(this.labels.numerator_label)} / ${this._withDefault(this.labels.denominator_label)}</dd>`
              }
            </dl>`: ``}
            
        

        <div class="layout horizontal justified">
          <div class="flex">
            ${this.dualReportingEnabled ? html`` : ``}
            <template is="dom-if" if="[[dualReportingEnabled]]" restamp="true">
              <h4>[[localize('progress_against_cluster_target')]]:</h4>
            </template>

            <table class="vertical layout">
              ${this._equals(this.formattedMapping?.length, 0) ? 
                html`<zero-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}" ?editable="${this.editable}">
                </zero-disaggregations>` : ``}
                                            
              ${this._equals(this.formattedMapping?.length, 1) ? 
                html`<one-disaggregation .data="${this.viewData}" .mapping="${this.formattedMapping}" ?editable="${this.editable}">
                </one-disaggregation>` : ``}
                                            
              ${this._equals(this.formattedMapping?.length, 2) ? 
                html`<two-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}" ?editable="${this.editable}">
                </two-disaggregations>` : ``}
                                            
              ${this._equals(this.formattedMapping?.length, 3) ? 
                html`<three-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}" ?editable="${this.editable}">
                </three-disaggregations>` : ``}
                                            
            </table>
          </div>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  labels!: GenericObject;

  @property({type: Object})
  totals!: GenericObject;

  @property({type: Array})
  byEntity: any[] = [];

  @property({type: Number})
  editable = 0;

  @property({type: String})
  app!: string;

  @property({type: Object})
  formattedData!: GenericObject;

  @property({type: Array})
  formattedMapping!: any[] | undefined;

  @property({type: Object})
  viewData!: GenericObject;

  @property({type: String})
  updateUrl: string = Endpoints.indicatorLocationDataEntries();

  @property({type: Boolean})
  editableBool!: boolean;

  @property({type: String})
  indicatorType!: string;

  @property({type: Boolean})
  viewLabel!: boolean;

  @property({type: Boolean})
  dualReportingEnabled!: boolean;

  @property({type: Array})
  reportingEntityPercentageMap!: any[];

  @property({type: Array})
  fields!: any[];

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Number})
  indicatorId!: number;

  stateChanged(state: RootState) {
    if(state?.app?.current && state.app.current !== this.app) {
      this.app = state.app.current;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('formattedData')) {
      this._cloneData(this.formattedData);
    }
    if (changedProperties.has('editableBool') || changedProperties.has('formattedData') || changedProperties.has('mapping')) {
      this.formattedMapping = this._computeMapping(this.editableBool, this.formattedData, this.mapping);
    }
    if (changedProperties.has('formattedData') || changedProperties.has('totals')) {
      this.viewData = this._computeViewData(this.formattedData, this.totals);
    }
    if (changedProperties.has('formattedData')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('data')) {
      this.indicatorType = this._computeIndicatorType(this.data)
    }    
    if (changedProperties.has('app') || changedProperties.has('indicatorType')) {
      this.viewLabel = this._computeLabelVisibility(this.app, this.indicatorType);
    }
    if (changedProperties.has('byEntity') || changedProperties.has('editableBool')) {
      this.dualReportingEnabled = this._computeDualReportingEnabled(this.byEntity, this.editableBool);
    }
    if (changedProperties.has('byEntity')) {
      this.reportingEntityPercentageMap = this._computeReportingEntityPercentageMap(this.byEntity);
    }    
    if (changedProperties.has('formattedData')) {
      this._resetFields();
    }
    if (changedProperties.has('localData') || changedProperties.has('reportingEntityPercentageMap')) {
      this._initPercentageMap(this.localData, this.reportingEntityPercentageMap);
    }
  }
  

  _registerField(e: CustomEvent) {
    e.stopPropagation();

    if (!this.fields) {
      this.fields = [];
    }

    this.push('fields', e.detail);
  }

  _fieldValueChanged(e: CustomEvent) {
    const key = e.detail.key;
    if (!key) {
      return;
    }
    const value = e.detail.value;
    let totals;

    const newValue = Object.assign(
      {
        c: null,
        d: null,
        v: null
      },
      this.localData.disaggregation[key],
      value
    );

    e.stopPropagation();

    this.localData.disaggregation[key] = newValue;
    this.totals[key] = newValue;

    switch (this.formattedData.level_reported) {
      case 1:
      case 2:
      case 3:
        totals = Object.assign(
          {},
          this.totals,
          // @ts-ignore
          this['_calculateLevel' + this.formattedData.level_reported](key, this.totals)
        );
        break;

      default:
        // For zero disaggregated data reporting, re-assign updated component totals
        // with local copy of totals.
        // Otherwise component totals get overwritten
        // by undefined local copy of totals
        totals = this.totals;
        break;
    }

    // Re-saving disaggregation data after total calculations
    // since totals contains entire disaggregation keyspace set
    // delete wrong generated keys (on _calculateLevel3)
    delete totals['(,)'];
    this.localData.disaggregation = totals;

    if (totals) {
      this.totals = totals;
    }
    this.requestUpdate();
  }

  _cloneData(formattedData: GenericObject) {
    if (!this.editableBool) {
      return;
    }

    this.localData = this._clone(formattedData);
    this.totals = this._clone(formattedData.disaggregation);
  }

  _resetFields() {
    this.fields = [];
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeLabelVisibility(app: string, indicatorType: string) {
    if (String(app) === 'ip-reporting' && String(indicatorType) === 'number') {
      return false;
    } else {
      return true;
    }
  }

  save() {
    if (!this.editable) {
      return Promise.reject();
    }

    this.fields.forEach(function (field) {
      field.validate();
    });

    const cellsValid = this.fields.every(function (field) {
      return !field.invalid;
    });

    const percentagesValid = this._fieldsAreValid();

    if (!cellsValid || !percentagesValid) {
      return Promise.reject();
    }

    const updateThunk = (this.shadowRoot!.querySelector('#update') as EtoolsPrpAjaxEl).thunk();
    (this.shadowRoot!.querySelector('#update') as EtoolsPrpAjaxEl).abort();

    return (
      this.reduxStore
        .dispatch(
          disaggregationsUpdateForLocation(updateThunk, String(this.indicatorId), this.formattedData.location.id)
        )
        // @ts-ignore
        .then((value) => {
          fireEvent(this, 'locations-updated');
          return value;
        })
    );
  }

  _triggerModalRefit(e: CustomEvent) {
    e.stopPropagation();

    if (!this.editableBool) {
      return;
    }

    fireEvent(this, 'disaggregation-modal-refit');
  }

  _computeMapping(editableBool: boolean, formattedData: GenericObject, mapping: any[]) {
    if (!formattedData) {
      return;
    }

    const reportedOn = formattedData.disaggregation_reported_on;

    return editableBool
      ? mapping.filter(function (disagg) {
          return reportedOn.indexOf(disagg.id) !== -1;
        })
      : mapping;
  }

  _computeIndicatorType(data: GenericObject) {
    return data.display_type;
  }

  _computeViewData(data: GenericObject, totals: GenericObject) {
    if (!data) {
      return {};
    }
    return Object.assign({}, data, {
      disaggregation: Object.assign({}, data.disaggregation, totals)
    });
  }

  _computeDualReportingEnabled(byEntity: any[], editableBool: boolean) {
    return byEntity.length > 1 && editableBool;
  }

  _computeReportingEntityPercentageMap(byEntity: any[]) {
    return byEntity
      .filter(function (location) {
        return !location.is_master_location_data;
      })
      .map(function (location) {
        return {
          title: location.reporting_entity.title,
          percentage: 1
        };
      });
  }

  // @ts-ignore
  _initPercentageMap(localData: GenericObject, map: any[]) {
    if (!map.length) {
      return;
    }

    this.localData.reporting_entity_percentage_map = map;
  }

  _formatPercentage(value: number) {
    return value * 100;
  }

  _parsePercentage(percentage: string) {
    return Number(percentage) / 100;
  }

  _handleInput(e: CustomEvent) {
    const input = e.target as any;

    input.validate();

    this.localData.reporting_entity_percentage_map[input.dataset.index].percentage = this._parsePercentage(input.value);
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    if (!this.totals) {
      this.totals = {};
    }
  }

  _addEventListeners() {
    if (this.editableBool) {
      this._registerField = this._registerField.bind(this);
      this.addEventListener('register-field', this._registerField as any);
      this._fieldValueChanged = this._fieldValueChanged.bind(this);
      this.addEventListener('field-value-changed', this._fieldValueChanged as any);
    }
  }

  _removeEventListeners() {
    if (this.editableBool) {
      this.removeEventListener('register-field', this._registerField as any);
      this.removeEventListener('field-value-changed', this._fieldValueChanged as any);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('disaggregation-table', DisaggregationTable);

export {DisaggregationTable as DisaggregationTableEl};
