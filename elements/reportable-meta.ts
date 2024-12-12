import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import './labelled-item';
import './report-status';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import './refresh-report-modal';
import UtilsMixin from '../mixins/utils-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {buttonsStyles} from '../styles/buttons-styles';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**

 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('reportable-meta')
export class ReportableMeta extends UtilsMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  public render() {
    return html`
      ${buttonsStyles}
      <style>
        :host {
          display: block;
        }

        labelled-item {
          font-size: 16px;
        }

        labelled-item:not(:last-child) {
          margin-bottom: 25px;
          margin-inline-start: 10px;
        }

        #input-button-container {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          flex-direction: row;
        }

        etools-input {
          width: 100%;
          padding-right: 18px;
        }
        etools-input::part(readonly-input-value) {
          border-bottom: 2px dotted var(--list-second-bg-color);
        }

        etools-radio-group {
          margin-left: -12px;
        }

        #toggle-button {
          font-size: 14px;
        }

        status-badge {
          position: relative;
          top: -2px;
        }

        #refresh-button {
          margin-block-end: 1rem;
        }
      </style>

      ${this.canRefresh
        ? html`<etools-button id="refresh-button" variant="primary" @click="${this._refresh}" ?disabled="${this.busy}">
            ${translate('REFRESH')}
          </etools-button>`
        : ``}

      <labelled-item .label="${translate('OVERALL_STATUS')}">
        ${this._equals(this.mode, 'view')
          ? html`<report-status .final="${this.completed}" .status="${this.data.overall_status}"></report-status>`
          : html`
              <etools-radio-group
                id="overall_status"
                .value="${this.data.overall_status}"
                @sl-change="${(e: any) => {
                  this.localData.overall_status = e.target.value;
                  this._localDataChanged(this.localData);
                }}"
              >
                <sl-radio value="Met">${this._computeMetLabel(this.completed)}</sl-radio>
                ${this.completed
                  ? ``
                  : html`<sl-radio value="OnT">${translate('ON_TRACK')}</sl-radio>
                      <sl-radio value="NoP">${translate('NO_PROGRESS')}</sl-radio>`}
                <sl-radio value="Con">${this._computeConstrainedLabel(this.completed)}</sl-radio>
                ${this.allowNoStatus ? html`<sl-radio value="NoS">${translate('NO_STATUS')}</sl-radio>` : ``}
              </etools-radio-group>
            `}
      </labelled-item>

      <labelled-item id="labelled-narrative" .label="${translate('NARRATIVE_ASSESSMENT')}">
        ${this._equals(this.mode, 'view')
          ? html`${this.data.narrative_assessment}`
          : html`
              <div id="input-button-container">
                <etools-input
                  id="narrative_assessment"
                  .value="${this.data.narrative_assessment}"
                  ?readonly="${!this.enableNarrativeAssessment}"
                  @value-changed="${({detail}) => (this.localData.narrative_assessment = detail.value)}"
                  char-counter
                  .charCount=${this.data?.narrative_assessment?.length}
                  maxlength="2000"
                >
                </etools-input>
                <etools-button variant="primary" id="toggle-button" @click="${this._handleButtonClick}">
                  ${this.localizedToggle}
                </etools-button>
              </div>
            `}
      </labelled-item>
    `;
  }

  @property({type: Boolean})
  enableNarrativeAssessment = false;

  @property({type: String})
  mode!: string;

  @property({type: String})
  toggle = 'Edit';

  @property({type: String})
  localizedToggle!: string;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  localData!: any;

  @property({type: Boolean, reflect: true})
  allowNoStatus = false;

  @property({type: Boolean, reflect: true})
  isCluster = false;

  @property({type: Boolean, reflect: true})
  completed = false;

  @property({type: Object})
  refreshData!: any;

  @property({type: Boolean})
  canRefresh = false;

  @property({type: String})
  refreshUrl: string = Endpoints.reportProgressReset();

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('toggle')) {
      this.localizedToggle = this._localizeToggle(this.toggle);
    }
    if (changedProperties.has('data')) {
      this.refreshData = this._computeRefreshData(this.data?.id);
    }
    if (changedProperties.has('isCluster') || changedProperties.has('data')) {
      this.canRefresh = this._computeCanRefresh(this.isCluster, this.data);
    }
  }

  _handleButtonClick() {
    if (this.toggle === 'Edit') {
      this.enableNarrativeAssessment = true;
      (this.shadowRoot?.querySelector('#narrative_assessment') as EtoolsInput).focus();
      this.toggle = 'Save';
      return;
    } else {
      this.enableNarrativeAssessment = false;
      this.toggle = 'Edit';
      this._localDataChanged(this.localData);
    }
    this.requestUpdate();
  }

  _computeMetLabel(completed: boolean) {
    if (completed) {
      return translate('ACHIEVED_AS_PLANNED');
    }
    return translate('MET');
  }

  _computeConstrainedLabel(completed: boolean) {
    if (completed) {
      return translate('NOT_ACHIEVED_AS_PLANNED');
    }
    return translate('CONSTRAINED');
  }

  _localizeToggle(toggle: string) {
    return translate(toggle.toLowerCase()) as any as string;
  }

  _localDataChanged(data) {
    fireEvent(this, 'reportable-meta-changed', data);
  }

  _computeRefreshData(reportId: string) {
    return {report_id: reportId, report_type: 'IR'};
  }

  _computeCanRefresh(isCluster: boolean, data: any) {
    return isCluster && data.can_submit;
  }

  _refresh() {
    openDialog({
      dialog: 'refresh-report-modal',
      dialogData: {
        refreshData: this.refreshData,
        refreshUrl: this.refreshUrl
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();

    this.localData = {};
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    const labelledItem = this.shadowRoot!.querySelectorAll('labelled-item');
    if (
      labelledItem &&
      labelledItem.length > 1 &&
      labelledItem[1] &&
      labelledItem[1].querySelector('etools-input') !== null
    ) {
      const paperButton = labelledItem[1].querySelector('etools-button');
      if (paperButton && paperButton.textContent!.trim() === 'Save') {
        this.localData.narrative_assessment = (labelledItem[1].querySelector('etools-input') as EtoolsInput).value;
      }
    }
  }
}

export {ReportableMeta as ReportableMetaEl};
