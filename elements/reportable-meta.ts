import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import './labelled-item';
import './report-status';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {RefreshReportModalEl} from './refresh-report-modal';
import './refresh-report-modal';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../mixins/utils-mixin';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import Endpoints from '../endpoints';
import {buttonsStyles} from '../styles/buttons-styles';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

/**
 * @polymer
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

          --paper-input-container-disabled: {
            opacity: 0.67;
          }
        }

        labelled-item {
          font-size: 16px;
        }

        labelled-item:not(:last-child) {
          margin-bottom: 25px;
        }

        #input-button-container {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          flex-direction: row;
        }

        paper-input {
          width: 100%;
          padding-right: 18px;
        }

        paper-radio-group {
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
                @sl-change="${this._handleInput}"
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
                  readonly
                  maxlength="2000"
                >
                </etools-input>
                <etools-button variant="primary" id="toggle-button" @click="${this._handleInput}">
                  ${this.localizedToggle}
                </etools-button>
              </div>
            `}
      </labelled-item>
      <refresh-report-modal id="refresh" .data="${this.refreshData}" .refresh-url="${this.refreshUrl}">
      </refresh-report-modal>
    `;
  }

  @property({type: String})
  mode!: string;

  @property({type: String})
  toggle = 'Edit';

  @property({type: String})
  localizedToggle!: string;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  localData: any = {};

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
    if (changedProperties.has('localData')) {
      this._localDataChanged(this.localData);
    }
  }

  _handleInput(event: CustomEvent) {
    let field = event.target as any;
    const narrativeTextInput = this.shadowRoot!.querySelector('#narrative_assessment') as PaperInputElement;

    if (narrativeTextInput && this.toggle === 'Edit' && field.id === 'toggle-button') {
      narrativeTextInput.disabled = false;
      narrativeTextInput.focus();
      this.toggle = 'Save';
      return;
    }

    if (field.id === 'toggle-button') {
      const parent: any = event.composedPath().find((node: any) => {
        return node.id === 'labelled-narrative';
      });
      if (parent) {
        field = parent.querySelector('paper-input');
      }
    }

    const id = field.id;
    switch (id) {
      case 'overall_status':
        this.localData.id = field.selected;
        break;

      case 'narrative_assessment':
        if (
          (field.value !== null && this.data.narrative_assessment === field.value.trim()) ||
          (field.value === null && this.data.narrative_assessment === null)
        ) {
          this.toggle = 'Edit';
          narrativeTextInput.disabled = true;
          break;
        }
        this.localData.id = field.value.trim();
        this.toggle = 'Edit';
        narrativeTextInput.disabled = true;
        break;
    }
    this.requestUpdate();
  }

  _computeMetLabel(completed: boolean) {
    if (completed) {
      return translate('MET_RESULTS');
    }
    return translate('MET');
  }

  _computeConstrainedLabel(completed: boolean) {
    if (completed) {
      return translate('CONSTRAINED_PARTIALLY');
    }
    return translate('CONSTRAINED');
  }

  _localizeToggle(toggle: string) {
    return translate(toggle.toLowerCase()) as any as string;
  }

  _localDataChanged(change: any) {
    if (change.path?.split('.').length < 2) {
      return;
    }

    fireEvent(this, 'reportable-meta-changed', this.localData);
  }

  _computeRefreshData(reportId: string) {
    return {report_id: reportId, report_type: 'IR'};
  }

  _computeCanRefresh(isCluster: boolean, data: any) {
    return isCluster && data.can_submit;
  }

  _refresh() {
    (this.shadowRoot!.getElementById('refresh') as RefreshReportModalEl).open();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    //@dci - check logic below...
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

      (this.shadowRoot!.getElementById('refresh') as RefreshReportModalEl).close();
    }
  }
}

export {ReportableMeta as ReportableMetaEl};
