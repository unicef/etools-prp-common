import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import './error-modal';
import './etools-prp-number';
import {sendRequest} from '@unicef-polymer/etools-utils/src/etools-ajax';
import {openDialog} from '@unicef-polymer/etools-utils/src/dialog.util';

/**
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 */
@customElement('refresh-report-modal')
export class RefreshReportModal extends LitElement {
  render() {
    return html`
      <style>
        etools-dialog {
          --divider-color: transparent;
        }
      </style>

      <etools-dialog
        size="lg"
        keep-dialog-open
        dialog-title="${translate('ARE_YOU_SURE')}"
        .okBtnText="${translate('REFRESH')}"
        @confirm-btn-clicked="${this._refresh}"
        ?disableConfirmBtn="${this.busy}"
        ?disableDismissBtn="${this.busy}"
      >
        <h3>
          ${this.data?.report_type === 'PR' ? html`${translate('YOU_ARE_ABOUT_TO_DELETE')}` : ``}
          ${this.data?.report_type === 'IR' ? html`${translate('YOU_ARE_ABOUT_TO_LOCATION')}` : ``}
        </h3>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  data: any = {};

  @property({type: String})
  refreshUrl?: string;

  @property({type: Boolean})
  busy = false;

  set dialogData(data: any) {
    const {refreshData, refreshUrl}: any = data;

    this.data = refreshData;
    this.refreshUrl = refreshUrl;
  }

  _refresh() {
    if (!this.refreshUrl) {
      return;
    }

    this.busy = true;

    sendRequest({
      method: 'POST',
      endpoint: {url: this.refreshUrl},
      body: this.data
    })
      .then(() => {
        window.location.reload();
      })
      .catch((err: any) => {
        this.busy = false;
        openDialog({
          dialog: 'error-modal',
          dialogData: {
            errors: err.response.non_field_errors
          }
        });
      });
  }
}

export {RefreshReportModal as RefreshReportModalEl};
