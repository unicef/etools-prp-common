import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-column';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-header';
import UtilsMixin from '../mixins/utils-mixin';
import './etools-prp-permissions';
import './confirm-box';
import './project-status';
import './page-body';
import './list-placeholder';
import './status-badge';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {tableStyles} from '../styles/table-styles';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';

/**
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 */
@customElement('pull-modal')
export class PullModal extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: String})
  reportingPeriod!: string;

  @property({type: String})
  indicatorName!: string;

  @property({type: Boolean})
  updatePending = false;

  @property({type: Object})
  postBody: any = {};

  @property({type: String})
  workspaceId!: string;

  @property({type: String})
  indicatorId!: string;

  @property({type: String})
  reportId!: string;

  @property({type: String})
  pullUrl!: string;

  @property({type: Object})
  data!: any;

  set dialogData(data: any) {
    const {indicatorName, reportingPeriod, indicatorId, reportId}: any = data;

    this.indicatorName = indicatorName;
    this.reportingPeriod = reportingPeriod;
    this.indicatorId = indicatorId;
    this.reportId = reportId;
  }

  render() {
    return html`
      ${tableStyles}
      <style>
        .qpr-header {
          transform: translate(24px, 48px);
        }

        .qpr-header h3 {
          font-size: 18px;
        }

        .qpr-header h4 {
          font-size: 16px;
        }

        .overwrite-notification {
          background-color: #ffcc00;
          margin: 20px;
        }

        .overwrite-notification iron-icon {
          top: 10px;
          margin: 12px;
        }

        etools-dialog {
          --divider-color: transparent;
        }
      </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>

      <etools-dialog id="dialog" size="lg" dialog-title="Pull data" @close=${this.close}>
        <div class="qpr-header">
          <h3>Reporting period: ${this.reportingPeriod}</h3>
          <h3>${this.indicatorName}</h3>
          <h4>For this high frequency indicator data will be pulled from reports matching this time period:</h4>
        </div>
        <etools-data-table-header no-collapse>
          <etools-data-table-column field="report">
            <div class="table-column">Report #</div>
          </etools-data-table-column>
          <etools-data-table-column field="due">
            <div class="table-column">Due date</div>
          </etools-data-table-column>
          <etools-data-table-column field="period">
            <div class="table-column">Reporting Period</div>
          </etools-data-table-column>
          <etools-data-table-column field="progress">
            <div class="table-column">Total indicator progress across all locations</div>
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.data?.reports || []).map(
          (report: any) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell table-cell--text">${report.report_name}</div>
                <div class="table-cell table-cell--text">${report.due_date}</div>
                <div class="table-cell table-cell--text">${report.start_date} - ${report.end_date}</div>
                <div class="table-cell table-cell--text">${report.report_location_total.v}</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <div class="layout horizontal justified overwrite-notification">
          <etools-icon name="info"></etools-icon>
          <p>
            In order to keep data intact, aggregated data will be shown as a total progress. Any data provided manually
            will be overwritten.
          </p>
        </div>

        <confirm-box id="confirm"></confirm-box>

        <etools-loading ?active="${this.updatePending}"></etools-loading>
      </etools-dialog>
    `;
  }

  _computePullUrl(workspaceId: string, reportId: string, indicatorId: string) {
    return Endpoints.indicatorPullData(workspaceId, reportId, indicatorId);
  }

  stateChanged(state: RootState) {
    if (state?.location?.id && state?.location?.id !== this.workspaceId) {
      this.workspaceId = state.location.id;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('workspaceId') ||
      changedProperties.has('reportId') ||
      changedProperties.has('indicatorId')
    ) {
      this.pullUrl = this._computePullUrl(this.workspaceId, this.reportId, this.indicatorId);
    }
  }

  _save() {
    sendRequest({
      method: 'POST',
      endpoint: {url: this.pullUrl},
      body: this.postBody
    })
      .then(() => {
        this.data = {reports: []};
        fireEvent(this, 'locations-updated');
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {
          text: err.response.non_field_errors[0],
          showCloseBtn: true
        });
      });
  }

  close(e: any) {
    if (e.detail.confirmed) {
      this._save();
    } else {
      this.data = {reports: []};
    }
  }

  open() {
    sendRequest({
      method: 'GET',
      endpoint: {url: this.pullUrl}
    })
      .then((res: any) => {
        this.data = {reports: res};
        this.opened = true;
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {
          text: err.response.non_field_errors[0],
          showCloseBtn: true
        });
      });
  }
}

export {PullModal as PullModalEl};
