import { html, css, LitElement } from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {translate, get as getTranslation} from 'lit-translate';
import './disaggregation-table';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {DisaggregationTableEl} from './disaggregation-table';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';

@customElement('disaggregation-modal')
class DisaggregationModal extends LitElement {
  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  updatePending = false;

  @property({type: Boolean})
  opened = false;

  static styles = [
    css`
      :host {
        display: block;
      }

      ::slotted([slot='disaggregation-table']) {
        margin-bottom: 1em;
      }
    `
  ];

  render() {
    return html`
      <etools-dialog
        keep-dialog-open
        size="lg"
        ?opened=${this.opened}
        @close=${() => (this.opened = false)}
        dialog-title="${translate('ENTER_DATA')} - ${translate('REPORTING_PERIOD')}: ${this.reportingPeriod}"
        .okBtnText="${translate('SAVE')}"
        @etools-dialog-opened="${() => {
          fireEvent(this, 'disaggregation-modal-opened-changed', {opened: true});
        }}"
        @etools-dialog-closed="${() => {
          fireEvent(this, 'disaggregation-modal-opened-changed', {opened: false});
        }}"
        @confirm-btn-clicked="${this._save}"
      >
        <slot name="meta"></slot>
        <slot name="disaggregation-table" class="table"></slot>

        <etools-loading ?active="${this.updatePending}"></etools-loading>
      </etools-dialog>
    `;
  }

  _save() {
    const tableElem = this.querySelector('disaggregation-table');
    if (tableElem) {
      this.updatePending = true;

      (tableElem as DisaggregationTableEl)
        .save()
        .then(() => {
          this.updatePending = false;
          fireEvent(this, 'dialog-closed', {confirmed: true});
        })
        .catch((err: any) => {
          console.log(err);
          this.updatePending = false;
          fireEvent(this, 'toast', {
            text: err.response?.non_field_errors?.[0] || getTranslation('ERROR_VERIFY_ENTERED_DATA'),
            showCloseBtn: true
          });
        });
    }
  }

  open() {
    this.opened = true;
  }
}

export { DisaggregationModal as DisaggregationModalEl };
