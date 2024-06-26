import { LitElement, PropertyValues, html } from 'lit';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {property} from 'lit/decorators.js';
import '../elements/status-badge';
import LocalizeMixin from '../mixins/localize-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import { store } from '../../redux/store';
import { RootState } from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class ReportStatus extends connect(store)(LocalizeMixin(LitElement)) {
   render() {
    return html` <style>
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
    if(state?.app?.current) {
     this.app = state.app.current;
    }
   }

   updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('status')) {
      this.type = this._computeType(this.status);
    }
    if (changedProperties.has('status') || changedProperties.has('final') ||
    changedProperties.has('app') || changedProperties.has('reportType') || changedProperties.has('localize')) {
      this.label = this._computeLabel(this.status, this.final, this.app, this.reportType, this.localize);
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

  _computeLabel(status: string, final: boolean, app: string, reportType: string, localize: any) {
    switch (status) {
      case '1':
        return localize('nothing_due');
      case '2':
      case 'Ove':
        return localize('overdue');
      case '3':
      case 'Due':
        return localize('due');
      case 'Sub':
        return localize('submitted');
      case 'Rej':
        return localize('rejected');
      case 'Met':
        return final ? localize('met_results') : localize('met');
      case 'OnT':
        return localize('on_track');
      case 'NoP':
        return localize('no_progress');
      case 'Con':
        return final ? localize('constrained_partially') : localize('constrained');
      case 'Ong':
        return localize('ongoing');
      case 'Pla':
        return localize('planned');
      case 'Com':
        return localize('completed');
      case 'NoS':
        return localize('no_status');
      case 'Sen':
        return localize('sent_back');
      case 'Not':
        return localize('not_yet_due');
      case 'Acc':
        return app === 'ip-reporting' && reportType !== 'HR' ? localize('accepted') : localize('received');
    }
  }
}

window.customElements.define('report-status', ReportStatus);
