import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import DisaggregationMixin from '../../mixins/disaggregations-mixin';
import '../message-box';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin DisaggregationMixin
 */
class DisaggregationSwitches extends UtilsMixin(LocalizeMixin(DisaggregationMixin(LitElement))) {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        .container {
          padding: 10px 24px;
          margin: 0 -24px;
          background: var(--paper-grey-100);
        }

        .container h4 {
          margin: 0 0 10px;
          font-size: 12px;
          line-height: 1;
        }

        paper-checkbox:not(:first-of-type) {
          margin-left: 24px;
        }

        message-box {
          margin-top: 10px;
        }
      </style>

      ${this.editableBool ? 
        html`<div class="container">
          <h4>${this.localize('enter_data_by_disaggregation')}</h4>
        ${(this.mapping || []).map((field) => 
        html`<paper-checkbox id="${field.id}" ?checked="${this._computeChecked(field.id)}" on-change="${this._fieldValueChanged}">
              ${this._formatFieldName(field.name)}
            </paper-checkbox>`)}

      ${this.warning ? html`<message-box type="warning">
              If one or more disaggregation box is unchecked, the reporting table will be simplified however the report
              will not be in line with the disaggregation agreed in the PD/SSFA.
            </message-box>` : ``}}
        </div>`: ``}
    `;
  }

  @property({type: Object})
  mapping!: GenericObject;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean})
  warning = true;

  @property({type: Array})
  reportedOn: number[] = [];

  @property({type: Object})
  formattedData!: GenericObject;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Boolean})
  editableBool!: boolean;

  fieldValueChanged!: Debouncer | null;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('data')) {
      this._cloneData(this.data);
    }
    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('data') || changedProperties.has('reportedOn')) {
      this._computeWarning(this.data.num_disaggregation, this.reportedOn.length);
    }
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _cloneData(data: GenericObject) {
    this.formattedData = this._clone(data);
  }

  _computeChecked(id: string) {
    const checked = this.formattedData.disaggregation_reported_on.indexOf(id) !== -1;
    this._updateReportedOn(id, checked);
    return checked;
  }

  _formatFieldName(name: string) {
    return this._capitalizeFirstLetter(name);
  }

  _fieldValueChanged(e: CustomEvent) {
    const field = <GenericObject>e.target;

    this.fieldValueChanged = Debouncer.debounce(this.fieldValueChanged, timeOut.after(100), () => {
      this._recordField(field);

      this._confirmIntent(field)
        .then(this._commit.bind(this))
        .catch((_err: GenericObject) => {
          this._revert.bind(this);
        });
    });
  }

  _confirmIntent(field: GenericObject) {
    const deferred = this._deferred();

    fireEvent(this, 'disaggregation-modal-confirm', deferred);

    return deferred.promise.catch(function () {
      return Promise.reject(field);
    });
  }

  _commit() {
    this.formattedData =  Object.assign({}, this.formattedData, {
        disaggregation: {},
        level_reported: this.reportedOn.length,
        disaggregation_reported_on: this.reportedOn
      })
   }

  _revert(field: GenericObject) {
    field.checked = !field.checked;
    this._recordField(field);
  }

  _computeWarning(numDisagg: number, reportedOnLength: number) {
    this.set('warning', !!numDisagg && reportedOnLength < numDisagg);
  }

  _recordField(field: GenericObject) {
    this._updateReportedOn(field.id, field.checked);
  }

  _updateReportedOn(ctrlId: string, checked: boolean) {
    const id = Number(ctrlId);
    if (checked) {
      this.push('reportedOn', id);
    } else if (this.reportedOn.indexOf(id) !== -1) {
      this.splice('reportedOn', this.reportedOn.indexOf(id), 1);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.set('reportedOn', []);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.fieldValueChanged && this.fieldValueChanged.isActive()) {
      this.fieldValueChanged.cancel();
    }
  }
}

window.customElements.define('disaggregation-switches', DisaggregationSwitches);
