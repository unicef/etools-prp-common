import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-styles/typography';
import '@polymer/iron-location/iron-location';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../mixins/utils-mixin';
import ModalMixin from '../mixins/modal-mixin';
import RoutingMixin from '../mixins/routing-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import './error-modal';
import './etools-prp-number';
import './etools-prp-ajax';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class RefreshReportModal extends LocalizeMixin(RoutingMixin(UtilsMixin(ModalMixin(LitElement)))) {
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

      <etools-prp-ajax
        id="refreshReport"
        .url="${this.refreshUrl}"
        .body="${this.data}"
        method="post"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <paper-dialog modal ?opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>${this.localize('are_you_sure')}?</h2>

          <etools-icon-button class="self-center" @click="${this.close}" name="icons:close"> </etools-icon-button>
        </div>
        <paper-dialog-scrollable>
          <h3>
            ${this._equals(this.data.report_type, 'PR') ? html`${this.localize('you_are_about_to_delete')}` : ``}
            ${this._equals(this.data.report_type, 'IR') ? html`${this.localize('you_are_about_to_location')}` : ``}
          </h3>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <etools-button variant="primary" @click="${this._refresh}" ?disabled="${this.busy}">
            ${this.localize('refresh')}
          </etools-button>
          <etools-button variant="primary" @click="${this._cancel}" ?disabled="${this.busy}">
            ${this.localize('cancel')}
          </etools-button>
        </div>
      </paper-dialog>
      <error-modal id="error"></error-modal>
    `;
  }

  @property({type: Object})
  data!: any;

  @property({type: Boolean})
  busy = false;

  _refresh() {
    this.busy = true;

    const refreshThunk = (this.shadowRoot!.getElementById('refreshReport') as EtoolsPrpAjaxEl).thunk();
    refreshThunk()
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

window.customElements.define('refresh-report-modal', RefreshReportModal);

export {RefreshReportModal as RefreshReportModalEl};
