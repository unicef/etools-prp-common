import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-loading/etools-loading';

import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-styles/typography';
import '@polymer/paper-input/paper-input';
import '@polymer/app-layout/app-grid/app-grid-style';
import ModalMixin from '../mixins/modal-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import './etools-prp-permissions';
import './confirm-box';
import './project-status';
import './page-body';
import './list-placeholder';
import './status-badge';
import './etools-prp-ajax';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {tableStyles} from '../styles/table-styles';
import {buttonsStyles} from '../styles/buttons-styles';
import {modalStyles} from '../styles/modal-styles';
import {EtoolsPrpAjaxEl} from './etools-prp-ajax';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin ModalMixin
 */
@customElement('pull-modal')
export class PullModal extends connect(store)(ModalMixin(UtilsMixin(LitElement))) {
  render() {
    return html`
      ${tableStyles} ${buttonsStyles} ${modalStyles}
      <style include="data-table-styles iron-flex iron-flex iron-flex-alignment iron-flex-reverse">
        :host {
          display: block;

          --header-title: {
            display: block;
          }
          --paper-dialog: {
            width: 800px;
          }
        }

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
      </style>

      <etools-prp-permissions
        .permissions="${this.permissions}"
        @permissions-changed="${(e) => (this.permissions = e.detail.value)}"
      >
      </etools-prp-permissions>

      <etools-prp-ajax id="pullReports" .url="${this.pullUrl}"> </etools-prp-ajax>

      <etools-prp-ajax
        id="pull"
        .url="${this.pullUrl}"
        method="post"
        .body="${this.postBody}"
        content-type="application/json"
      >
      </etools-prp-ajax>

      <paper-dialog id="dialog" modal ?opened="${this.opened}">
        <div class="header layout horizontal justified">
          <h2>Pull data</h2>
          <div class="layout horizontal">
            <p>Reporting period: ${this.reportingPeriod}</p>

            <etools-icon-button class="self-center" @click="${this.close}" name="icons:close"> </etools-icon-button>
          </div>
        </div>

        <paper-dialog-scrollable>
          <div class="qpr-header">
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

          ${(this.data.reports || []).amp(
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
          )};

          <div class="layout horizontal justified overwrite-notification">
            <etools-icon name="icons:info"></etools-icon>
            <p>
              In order to keep data intact, aggregated data will be shown as a total progress. Any data provided
              manually will be overwritten.
            </p>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons layout horizontal-reverse">
          <etools-button variant="primary" @click="${this._save}"> OK </etools-button>
        </div>

        <confirm-box id="confirm"></confirm-box>

        <etools-loading ?active="${this.updatePending}"></etools-loading>
      </paper-dialog>
    `;
  }

  @property({type: String})
  reportingPeriod!: string;

  @property({type: String})
  indicatorName!: string;

  @property({type: Boolean})
  opened!: boolean;

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
    (this.shadowRoot!.getElementById('pull') as EtoolsPrpAjaxEl)
      .thunk()()
      .then(() => {
        this.close();
        fireEvent(this, 'locations-updated');
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {
          text: err.data.non_field_errors[0],
          showCloseBtn: true
        });
      });
  }

  close() {
    this.opened = false;
    this.data = {reports: []};
  }

  open() {
    (this.shadowRoot!.getElementById('pullReports') as EtoolsPrpAjaxEl).abort();

    const thunk = (this.shadowRoot!.getElementById('pullReports') as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: any) => {
        this.data = {reports: res.data};
        this.opened = true;
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {
          text: err.data.non_field_errors[0],
          showCloseBtn: true
        });
      });
  }
}

export {PullModal as PullModalEl};
