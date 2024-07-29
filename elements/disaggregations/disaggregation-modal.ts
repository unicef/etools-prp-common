import { html, css, LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';


import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-button/paper-button';


import {translate, get as getTranslation} from 'lit-translate';
import {buttonsStyles} from '../../styles/buttons-styles';
import {modalStyles} from '../../styles/modal-styles';
import '../confirm-box';
import './disaggregation-table';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {DisaggregationTableEl} from './disaggregation-table';
import {ConfirmBoxEl} from '../confirm-box';
import UtilsMixin from '../../mixins/utils-mixin';

@customElement('disaggregation-modal')
export class DisaggregationModal extends UtilsMixin(LitElement) {
  @property({type: String})
  reportingPeriod!: string;

  @property({type: Boolean})
  updatePending = false;

  @property({type: Boolean})
  hasPD = false;

  @property({type: Object})
  topLevelLocation!: any;

  @property({type: Object})
  currentPd!: any;

  @property({type: String})
  indicatorName!: string;

  @property({type: Object})
  disaggregations!: any;

  @property({type: Number})
  indicatorId!: number;

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {indicatorName, currentPd, topLevelLocation, reportingPeriod, disaggregations, indicatorId}: any = data;
    this.indicatorName = indicatorName;
    this.currentPd = currentPd;
    this.hasPD = !!Object.keys(currentPd).length;
    this.topLevelLocation = topLevelLocation;
    this.reportingPeriod = reportingPeriod;
    this.disaggregations = disaggregations;
    this.indicatorId = indicatorId;
  }

  static styles = [
    css`
      :host {
        display: block;
      }

      paper-dialog {
        width: 700px;
      }

      ::slotted([slot='disaggregation-table']) {
        margin-bottom: 1em;
      }
    `
  ];

  render() {
    return html`
      ${buttonsStyles} ${modalStyles}      
      <etools-dialog
        id="addUserDialog"
        size="md"
        opened
        dialog-title="${translate('ENTER_DATA')} ${translate('REPORTING_PERIOD')}: ${this.reportingPeriod}"
        ok-btn-text="${translate('SAVE')}"
        cancel-btn-text=${translate('CANCEL')}
        keep-dialog-open
        @confirm-btn-clicked="${this._save}"
        @close="${() => this.onClose()}"
        ?show-spinner="${this.updatePending}"
      >
        <div class="container-dialog">

          <div>
              <h3>${this.indicatorName}</h3>
              <p class="location">
                <iron-icon icon="maps:place"></iron-icon>
                ${this.topLevelLocation?.name}
              </p>
              ${this.hasPD
                ? html`<p class="current-pd">
                    ${this.currentPd.agreement} | ${this.currentPd.title}
                  </p>`
                : ``}
            </div>
            <div class="layout-vertical end-justified">
              <dl class="location-progress">
                <dt>${translate('LOCATION_PROGRESS')}</dt>
                <dd>
                  ${this.topLevelLocation?.byEntity[0].display_type ==  'number'
                    ? html`<etools-prp-number
                        .value="${this.topLevelLocation?.byEntity[0].location_progress.v}"
                      ></etools-prp-number>`
                    : html`<span
                        >${this._formatIndicatorValue(
                          this.topLevelLocation?.byEntity[0].display_type,
                          this.topLevelLocation?.byEntity[0].location_progress.c,
                          1
                        )}</span
                      >`}
                </dd>
              </dl>
            </div>

            <disaggregation-table
              slot="disaggregation-table"
              .data="${this.topLevelLocation.byEntity[0]}"
              .byEntity="${this.topLevelLocation.byEntity}"
              .mapping="${this.disaggregations.disagg_lookup_map}"
              .labels="${this.disaggregations.labels}"
              .indicatorId="${this.indicatorId}"
              editable="1"
            >
            </disaggregation-table>


          <confirm-box id="confirm"></confirm-box>
        </div>
      </etools-dialog>
    `;
  }

  _save() {
    const tableElem = this.shadowRoot!.querySelector('disaggregation-table');
    if (tableElem) {
      this.updatePending = true;

      (tableElem as DisaggregationTableEl)
        .save()
        .then(() => {
          this.updatePending = false;
          this.onClose();
        })
        .catch((_err: any) => {
          console.log(_err);
          this.updatePending = false;
          fireEvent(this, 'toast', {
            text: getTranslation('ERROR_VERIFY_ENTERED_DATA'),
            showCloseBtn: true
          });
        });
    }
  }

  _confirm(e: CustomEvent) {
    e.stopPropagation();

    const confirmBox = this.shadowRoot!.getElementById('confirm') as ConfirmBoxEl;
    confirmBox.run({
      body: 'Changing disaggregation will cause your previous data to be lost. Do you want to continue?',
      result: e.detail
    });
  }

  onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

}

export { DisaggregationModal as DisaggregationModalEl };
