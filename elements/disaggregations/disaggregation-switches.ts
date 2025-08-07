import {html, LitElement} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import DisaggregationMixin from '../../mixins/disaggregations-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles.js';
import '../message-box';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {capitalizeFirstLetter} from '@unicef-polymer/etools-utils/dist/general.util';

@customElement('disaggregation-switches')
class DisaggregationSwitches extends DisaggregationMixin(LitElement) {
  @property({type: Object})
  mapping!: any;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean})
  warning = true;

  @state() reportedOn!: number[];

  @property({type: Object})
  formattedData!: any;

  @property({type: Object})
  data!: any;

  @property({type: Boolean})
  editableBool!: boolean;

  render() {
    return html`
      <style>
        ${layoutStyles} :host {
          display: block;
        }

        .container {
          padding: 10px 24px;
          margin-block-end: 8px;
          background: var(--sl-color-neutral-100);
        }

        .container h4 {
          margin: 0 0 10px;
          font-size: 12px;
          line-height: 1;
          display: block;
        }

        etools-checkbox:not(:first-of-type) {
          margin-left: 24px;
        }

        message-box {
          margin-top: 10px;
        }
      </style>
      ${this.editableBool
        ? html`
            <div class="container">
              <h4>${translate('ENTER_DATA_BY_DISAGGREGATION')}</h4>
              <div class="layout-horizontal">
                ${(this.mapping || []).map(
                  (field) => html`
                    <etools-checkbox
                      id="${field.id}"
                      ?checked="${this._computeChecked(field.id)}"
                      @sl-change="${(e: any) => this.fieldValueChanged(e.target)}"
                    >
                      ${this._formatFieldName(field.name)}
                    </etools-checkbox>
                  `
                )}
              </div>
              ${this.warning
                ? html`
                    <message-box type="warning">
                      If one or more disaggregation box is unchecked, the reporting table will be simplified however the
                      report will not be in line with the disaggregation agreed in the PD/SPD.
                    </message-box>
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('data') || changedProperties.has('reportedOn')) {
      this._computeWarning(this.data?.num_disaggregation, this.reportedOn?.length);
    }
    if (changedProperties.has('formattedData')) {
      if (this.formattedData && Object.keys(this.formattedData).length && !this.reportedOn) {
        this.reportedOn = [...(this.formattedData.disaggregation_reported_on || [])];
      }
    }
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeChecked(id: string) {
    return this.formattedData.disaggregation_reported_on.indexOf(id) !== -1;
  }

  _formatFieldName(name: string) {
    return capitalizeFirstLetter(name);
  }

  fieldValueChanged(field: any) {
    this._recordField(field);
    this._confirmIntent(field)
      .then(() => this._commit())
      .catch(() => this._revert(field));
  }

  _confirmIntent(field: any) {
    return new Promise((resolve, reject) => {
      openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: 'Changing disaggregation will cause your previous data to be lost. Do you want to continue?',
          confirmBtnText: translate('CONTINUE'),
          cancelBtnText: translate('CANCEL')
        }
      }).then(({confirmed}) => {
        if (confirmed) {
          return resolve(field);
        } else {
          return reject(field);
        }
      });
    });
  }

  _commit() {
    this.formattedData = {
      ...this.formattedData,
      disaggregation: {},
      level_reported: this.reportedOn.length,
      disaggregation_reported_on: this.reportedOn
    };
    fireEvent(this, 'formatted-data-changed', {value: this.formattedData});
  }

  _revert(field: any) {
    field.checked = !field.checked;
    this._recordField(field);
  }

  _computeWarning(numDisagg: number, reportedOnLength: number) {
    this.warning = !!numDisagg && reportedOnLength < numDisagg;
  }

  _recordField(field: any) {
    this._updateReportedOn(field.id, field.checked);
  }

  _updateReportedOn(ctrlId: string, checked: boolean) {
    const id = Number(ctrlId);
    if (checked) {
      if (!this.reportedOn.includes(id)) {
        this.reportedOn = [...this.reportedOn, id];
      }
    } else if (this.reportedOn.indexOf(id) !== -1) {
      this.reportedOn = this.reportedOn.filter((reportedId) => reportedId !== id);
    }
  }
}

export {DisaggregationSwitches as DisaggregationSwitchesEl};
