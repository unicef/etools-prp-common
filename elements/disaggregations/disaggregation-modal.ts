import { html, css, LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-loading/etools-loading';
import ModalMixin from '../../mixins/modal-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import { buttonsStyles } from '../../styles/buttons-styles';
import { modalStyles } from '../../styles/modal-styles';
import '../confirm-box';
import './disaggregation-table';
import { fireEvent } from '@unicef-polymer/etools-utils/dist/fire-event.util';
import { DisaggregationTableEl } from './disaggregation-table';
import { ConfirmBoxEl } from '../confirm-box';

@customElement('disaggregation-modal')
class DisaggregationModal extends LocalizeMixin(ModalMixin(LitElement)) {
  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  updatePending = false;

  static styles = [
    css`
      :host {
        display: block;
      }

      paper-dialog {
        width: 700px;
      }

      ::slotted([slot='disaggregation-table']) {
        margin-bottom: 1em;
      }
    `
  ];

  render() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <paper-dialog id="dialog" modal .opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>${this.localize('enter_data')}</h2>

          <div class="layout horizontal">
            <p>${this.localize('reporting_period')}: ${this.reportingPeriod}</p>

            <paper-icon-button class="self-center" @click="${this.close}" icon="icons:close"></paper-icon-button>
          </div>
        </div>

        <paper-dialog-scrollable>
          <slot name="meta"></slot>
          <slot name="disaggregation-table" class="table"></slot>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <paper-button class="btn-primary" @click="${this._save}" raised>${this.localize('save')}</paper-button>
          <paper-button class="btn-cancel" @click="${this.close}">${this.localize('cancel')}</paper-button>
        </div>

        <confirm-box id="confirm"></confirm-box>

        <etools-loading .active="${this.updatePending}"></etools-loading>
      </paper-dialog>
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
          this.close();
        })
        .catch((_err: any) => {
          console.log(_err);
          this.updatePending = false;
          fireEvent(this, 'toast', {
            text: this.localize('error_verify_entered_data'),
            showCloseBtn: true
          });
        });
    }
  }

  _confirm(e: CustomEvent) {
    e.stopPropagation();

    const confirmBox = this.shadowRoot!.getElementById('confirm') as ConfirmBoxEl;
    confirmBox.run({
      body: 'Changing disaggregation will cause your previous data to be lost. Do you want to continue?',
      result: e.detail
    });
  }

  _addEventListeners() {
    this._boundClose = this.close.bind(this);
    this.addEventListener('dialog-iron-overlay-closed', this._boundClose);
    this._boundAdjustPosition = this.adjustPosition.bind(this);
    this.addEventListener('disaggregation-modal-refit', this._boundAdjustPosition as any);
    this._boundConfirm = this._confirm.bind(this);
    this.addEventListener('disaggregation-modal-confirm', this._boundConfirm as any);
  }

  _removeEventListeners() {
    this.removeEventListener('dialog-iron-overlay-closed', this._boundClose);
    this.removeEventListener('disaggregation-modal-refit', this._boundAdjustPosition as any);
    this.removeEventListener('disaggregation-modal-confirm', this._boundConfirm as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

export { DisaggregationModal as DisaggregationModalEl };
