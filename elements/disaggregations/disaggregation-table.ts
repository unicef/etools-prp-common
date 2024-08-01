import {LitElement, html, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import {translate} from 'lit-translate';
import DisaggregationHelpersMixin from '../../mixins/disaggregation-helpers-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import Endpoints from '../../endpoints';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {disaggregationsUpdateForLocation} from '../../../redux/actions/disaggregations';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import './table-content/three-disaggregations';
import './table-content/two-disaggregations';
import './table-content/one-disaggregation';
import './table-content/zero-disaggregations';
import './disaggregation-switches';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {store} from '../../../redux/store';
import {RootState} from '../../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

@customElement('disaggregation-table')
export class DisaggregationTable extends DisaggregationHelpersMixin(UtilsMixin(LitElement)) {
  @property({type: Object})
  data!: any;

  @property({type: Object})
  labels!: any;

  @property({type: Object})
  totals!: any;

  @property({type: Array})
  byEntity: any[] = [];

  @property({type: Number})
  editable = 0;

  @property({type: String, state: true})
  app?: string;

  @property({type: Object})
  formattedData: any = {};

  @property({type: Array})
  formattedMapping: any[] = [];

  @property({type: Object})
  viewData!: any;

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
  localData!: any;

  @property({type: Array})
  mapping!: any[];

  @property({type: Number})
  indicatorId!: number;

  static styles = [
    layoutStyles,
    css`
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

      .percentage-map etools-input {
        width: 60px;
        padding: 0;
        margin: 0 5px;
        text-align: center;
      }

      .percentage-map .entity-name {
        display: inline-block;
        padding: 3px 10px;
        white-space: nowrap;
        background-color: var(--sl-color-neutral-100);
      }
      .justified {
        justify-content: space-between;
      }
      .flex {
        flex: 1;
      }
    `
  ];

  render() {
    return html`
      ${disaggregationTableStyles}
      <div>
        <disaggregation-switches
          .data="${this.data}"
          .mapping="${this.mapping}"
          .editable="${this.editable}"
          .formattedData="${this.formattedData}"
          @formatted-data-changed="${this._triggerModalRefit}"
        >
        </disaggregation-switches>

        ${this.viewLabel
          ? html`<dl class="data-key">
              <dt>${translate('LABEL')} -</dt>
              ${this.data?.display_type === 'number'
                ? html`<dd>${this._withDefault(this.labels?.label)}</dd>`
                : html`<dd>
                    ${this._withDefault(this.labels?.numerator_label)} /
                    ${this._withDefault(this.labels?.denominator_label)}
                  </dd>`}
            </dl>`
          : ''}

        <div class="layout-horizontal justified">
          <div class="flex">
            ${this.dualReportingEnabled ? html`<h4>${translate('PROGRESS_AGAINST_CLUSTER_TARGET')}:</h4>` : ''}

            <table class="layout-vertical">
              ${this.formattedMapping?.length === 0
                ? html`<zero-disaggregations
                    .data="${this.viewData}"
                    .mapping="${this.formattedMapping}"
                    .editable="${this.editable}"
                  ></zero-disaggregations>`
                : ''}
              ${this.formattedMapping?.length === 1
                ? html`<one-disaggregation
                    .data="${this.viewData}"
                    .mapping="${this.formattedMapping}"
                    .editable="${this.editable}"
                  ></one-disaggregation>`
                : ''}
              ${this.formattedMapping?.length === 2
                ? html`<two-disaggregations
                    .data="${this.viewData}"
                    .mapping="${this.formattedMapping}"
                    .editable="${this.editable}"
                  ></two-disaggregations>`
                : ''}
              ${this.formattedMapping?.length === 3
                ? html`<three-disaggregations
                    .data="${this.viewData}"
                    .mapping="${this.formattedMapping}"
                    .editable="${this.editable}"
                  ></three-disaggregations>`
                : ''}
            </table>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.totals) {
      this.totals = {};
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  stateChanged(state: RootState): void {
    if (this.app !== state.app.current) {
      this.app = state.app.current;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('formattedData')) {
      this._resetFields();
    }

    if (changedProperties.has('localData') || changedProperties.has('reportingEntityPercentageMap')) {
      this._initPercentageMap(this.localData, this.reportingEntityPercentageMap);
    }

    if (
      changedProperties.has('editableBool') ||
      changedProperties.has('formattedData') ||
      changedProperties.has('mapping')
    ) {
      this.formattedMapping = this._computeMapping(this.editableBool, this.formattedData, this.mapping);
    }

    if (changedProperties.has('formattedData') || changedProperties.has('totals')) {
      this.viewData = this._computeViewData(this.formattedData, this.totals);
    }

    if (changedProperties.has('formattedData') && this.editableBool) {
      this.localData = this._clone(this.formattedData);
      this.totals = this._clone(this.formattedData.disaggregation);
    }

    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
      this._addEventListeners();
    }

    if (changedProperties.has('data')) {
      this.indicatorType = this._computeIndicatorType(this.data);
      this.formattedData = this._clone(this.data);
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

  _registerField(e: CustomEvent) {
    e.stopPropagation();
    if (!this.fields) {
      this.fields = [];
    }
    this.fields = [...this.fields, e.detail];
  }

  _fieldValueChanged(e: CustomEvent) {
    const key = e.detail.key;
    if (!key) {
      return;
    }
    const value = e.detail.value;
    let totals;

    if (!this.localData.disaggregation) {
      this.localData.disaggregation = {};
    }
    if (!this.totals) {
      this.totals = {};
    }

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
        totals = {
          ...this.totals,
          ...this[`_calculateLevel${this.formattedData.level_reported}`](key, this.totals)
        };
        break;

      default:
        totals = this.totals;
        break;
    }

    delete totals['(,)'];

    this.localData = {
      ...this.localData,
      disaggregation: totals
    };

    if (totals) {
      this.totals = totals;
    }
  }

  _cloneData(formattedData: any) {
    if (!this.editableBool) {
      return;
    }

    this.localData = {...formattedData};
    this.totals = {...formattedData.disaggregation};
  }

  _resetFields() {
    this.fields = [];
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeLabelVisibility(app?: string, indicatorType?: string) {
    return !(String(app) === 'ip-reporting' && String(indicatorType) === 'number');
  }

  save() {
    if (!this.editable) {
      return Promise.reject();
    }

    this.fields.forEach((field) => {
      field.validate();
    });

    const cellsValid = this.fields.every((field) => !field.invalid);
    const percentagesValid = this._fieldsAreValid();

    if (!cellsValid || !percentagesValid) {
      return Promise.reject();
    }

    const updateThunk = sendRequest({
      method: 'PUT',
      endpoint: {url: this.updateUrl},
      body: this.localData
    });

    return store
      .dispatch(disaggregationsUpdateForLocation(updateThunk, String(this.indicatorId), this.formattedData.location.id))
      .then(() => {
        fireEvent(this, 'locations-updated');
        this.dispatchEvent(
          new CustomEvent('locations-updated', {
            detail: {},
            bubbles: true,
            composed: true
          })
        );
        return true;
      });
  }

  _triggerModalRefit(e: CustomEvent) {
    if (e.detail.value && !isJsonStrMatch(this.formattedData, e.detail.value)) {
      this.formattedData = e.detail.value;
    }

    e.stopPropagation();
    if (!this.editableBool) {
      return;
    }
    fireEvent(this, 'disaggregation-modal-refit');
  }

  _computeMapping(editableBool: boolean, formattedData: any, mapping: any[]) {
    if (!formattedData) {
      return [];
    }

    const reportedOn = formattedData.disaggregation_reported_on;

    return editableBool ? mapping.filter((disagg) => reportedOn.indexOf(disagg.id) !== -1) : mapping;
  }

  _computeIndicatorType(data: any) {
    return data.display_type;
  }

  _computeViewData(data: any, totals: any) {
    if (!data) {
      return {};
    }

    return Object.assign({}, data, {
      disaggregation: Object.assign({}, data.disaggregation, totals)
    });

    // return {
    //   ...data,
    //   disaggregation: {
    //     ...data.disaggregation,
    //     ...totals
    //   }
    // };
  }

  _computeDualReportingEnabled(byEntity: any[], editableBool: boolean) {
    return byEntity.length > 1 && editableBool;
  }

  _computeReportingEntityPercentageMap(byEntity: any[]) {
    return byEntity
      .filter((location) => !location.is_master_location_data)
      .map((location) => ({
        title: location.reporting_entity.title,
        percentage: 1
      }));
  }

  _initPercentageMap(localData: any, map: any[]) {
    if (!map.length || isJsonStrMatch(this.localData?.reporting_entity_percentage_map, map)) {
      return;
    }

    this.localData = {
      ...localData,
      reporting_entity_percentage_map: map
    };
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

    this.localData = {
      ...this.localData,
      reporting_entity_percentage_map: this.localData.reporting_entity_percentage_map.map((item, index) =>
        index === Number(input.dataset.index) ? {...item, percentage: this._parsePercentage(input.value)} : item
      )
    };
  }
}

export {DisaggregationTable as DisaggregationTableEl};
