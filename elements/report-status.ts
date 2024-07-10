import {LitElement, html} from 'lit';
import {connect} from 'pwa-helpers';
import {customElement, property} from 'lit/decorators.js';
import '../elements/status-badge';
import LocalizeMixin from '../mixins/localize-mixin';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
@customElement('report-status')
export class ReportStatus extends LocalizeMixin(connect(store)(LitElement)) {
  render() {
    return html`
      <style>
        :host {
          display: inline-block;
          margin-right: 0.5em;
        }

        status-badge {
          display: inline-block;
          vertical-align: middle;
          position: relative;
          top: -3px;
        }
        status-badge {
          width: 16px;
          height: 16px;
        }
      </style>

      <status-badge type="${this.type}"></status-badge>
      ${this.noLabel ? html`` : html`${this.label}`}
    `;
  }

  @property({type: String})
  status!: string;

  @property({type: Boolean})
  noLabel = false;

  @property({type: String})
  type!: string;

  @property({type: String})
  label!: string;

  @property({type: Boolean})
  final = false;

  @property({type: String})
  app!: string;

  @property({type: String})
  reportType = '';

  stateChanged(state: RootState) {
    if (state?.app?.current) {
      this.app = state.app.current;
    }
  }

  updated(changedProperties): void {
    super.updated(changedProperties);

    if (changedProperties.has('status')) {
      this.type = this._computeType(this.status);
    }
    if (
      changedProperties.has('status') ||
      changedProperties.has('final') ||
      changedProperties.has('app') ||
      changedProperties.has('reportType') ||
      changedProperties.has('localize')
    ) {
      this.label = this._computeLabel(this.status, this.final, this.app, this.reportType);
    }
  }

  _computeType(status: string) {
    switch (status) {
      case '1':
      case 'Sub':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        return 'success';
      case '2':
      case 'Ove':
      case 'Sen':
        return 'error';
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        return 'neutral';
      case 'Rej':
      case 'Con':
      case 'Pla':
        return 'warning';
      case 'NoS':
        return 'no-status';
    }
    return 'no-status';
  }

  _computeLabel(status: string, final: boolean, app: string, reportType: string) {
    switch (status) {
      case '1':
        return this.localize('nothing_due');
      case '2':
      case 'Ove':
        return this.localize('overdue');
      case '3':
      case 'Due':
        return this.localize('due');
      case 'Sub':
        return this.localize('submitted');
      case 'Rej':
        return this.localize('rejected');
      case 'Met':
        return final ? this.localize('met_results') : this.localize('met');
      case 'OnT':
        return this.localize('on_track');
      case 'NoP':
        return this.localize('no_progress');
      case 'Con':
        return final ? this.localize('constrained_partially') : this.localize('constrained');
      case 'Ong':
        return this.localize('ongoing');
      case 'Pla':
        return this.localize('planned');
      case 'Com':
        return this.localize('completed');
      case 'NoS':
        return this.localize('no_status');
      case 'Sen':
        return this.localize('sent_back');
      case 'Not':
        return this.localize('not_yet_due');
      case 'Acc':
        return app === 'ip-reporting' && reportType !== 'HR' ? this.localize('accepted') : this.localize('received');
    }
  }
}

export {ReportStatus as ReportStatusEl};
