import {LitElement, html} from 'lit';
import {connect} from '@unicef-polymer/etools-utils/src/pwa.utils';
import {customElement, property} from 'lit/decorators.js';
import '../elements/status-badge';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {store} from '@etools-apps/prp/src_ts/redux/store';
import {RootState} from '@etools-apps/prp/src_ts/typings/redux.types';

/**
 * @customElement
 * @mixinFunction
 */
@customElement('report-status')
export class ReportStatus extends connect(store)(LitElement) {
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
          padding-inline-end: 6px;
        }
        status-badge {
          width: 16px;
          height: 16px;
        }
      </style>

      <status-badge .type="${this.type}"></status-badge>
      ${this.noLabel ? html`` : html`${this.label}`}
    `;
  }

  @property({type: String})
  status!: string;

  @property({type: Boolean, attribute: 'no-label'})
  noLabel = false;

  @property({type: String})
  type!: string;

  @property({type: String})
  label?: string;

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
      changedProperties.has('reportType')
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
        return translate('NOTHING_DUE') as any as string;
      case '2':
      case 'Ove':
        return translate('OVERDUE') as any as string;
      case '3':
      case 'Due':
        return translate('DUE') as any as string;
      case 'Sub':
        return translate('SUBMITTED') as any as string;
      case 'Rej':
        return translate('REJECTED') as any as string;
      case 'Met':
        return final ? (translate('ACHIEVED_AS_PLANNED') as any as string) : (translate('MET') as any as string);
      case 'OnT':
        return translate('ON_TRACK') as any as string;
      case 'NoP':
        return translate('NO_PROGRESS') as any as string;
      case 'Con':
        return final
          ? (translate('NOT_ACHIEVED_AS_PLANNED') as any as string)
          : (translate('CONSTRAINED') as any as string);
      case 'Ong':
        return translate('ONGOING') as any as string;
      case 'Pla':
        return translate('PLANNED') as any as string;
      case 'Com':
        return translate('COMPLETED') as any as string;
      case 'NoS':
        return translate('NO_STATUS') as any as string;
      case 'Sen':
        return translate('SENT_BACK') as any as string;
      case 'Not':
        return translate('NOT_YET_DUE') as any as string;
      case 'Acc':
        return app === 'ip-reporting' && reportType !== 'HR'
          ? (translate('ACCEPTED') as any as string)
          : (translate('RECEIVED') as any as string);
    }
  }
}

export {ReportStatus as ReportStatusEl};
