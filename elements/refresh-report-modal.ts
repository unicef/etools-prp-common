import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-styles/typography';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import {translate} from 'lit-translate';
import './error-modal';
import './etools-prp-number';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
@customElement('refresh-report-modal')
export class RefreshReportModal extends RoutingMixin(UtilsMixin(ModalMixin(LitElement))) {
  render() {
    return html`
      ${buttonsStyles} ${modalStyles}
      <style include="app-grid-style iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;
          --paper-dialog: {
            width: 750px;
          }
        }
      </style>

      <iron-location .path="${this.path}"> </iron-location>

      <paper-dialog modal ?opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>${translate('ARE_YOU_SURE')}?</h2>

          <etools-icon-button class="self-center" @click="${this.close}" name="icons:close"> </etools-icon-button>
        </div>
        <paper-dialog-scrollable>
          <h3>
            ${this._equals(this.data?.report_type, 'PR') ? html`${translate('YOU_ARE_ABOUT_TO_DELETE')}` : ``}
            ${this._equals(this.data?.report_type, 'IR') ? html`${translate('YOU_ARE_ABOUT_TO_LOCATION')}` : ``}
          </h3>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <etools-button variant="primary" @click="${this._refresh}" ?disabled="${this.busy}">
            ${translate('REFRESH')}
          </etools-button>
          <etools-button variant="primary" @click="${this._cancel}" ?disabled="${this.busy}">
            ${translate('CANCEL')}
          </etools-button>
        </div>
      </paper-dialog>
      <error-modal id="error"></error-modal>
    `;
  }

  @property({type: Object})
  data: any = {};

  @property({type: Boolean})
  busy = false;

  _refresh() {
    this.busy = true;

    sendRequest({
      method: 'POST',
      endpoint: {url: this.refreshUrl},
      body: this.data
    })
      .then(() => {
        window.location.reload();
      })
      .catch((res: any) => {
        console.log(res);
        this.busy = false;
      });
  }

  _cancel() {
    this.close();
  }
}

export {RefreshReportModal as RefreshReportModalEl};
