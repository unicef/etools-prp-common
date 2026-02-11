import {css, html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles.js';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import './disaggregation-table';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {DisaggregationTableEl} from './disaggregation-table';
import {displayIndicatorValueFromatted} from '../../../utils/utils';

@customElement('disaggregation-modal')
export class DisaggregationModal extends LitElement {
  static styles = css`
    ${layoutStyles}
    etools-icon {
      --etools-icon-fill-color: var(--sl-color-primary-400);
    }
    h3 {
      margin-block-start: 0;
    }
    .half {
      width: 50%;
    }
    .current-pd {
      margin: 0;
      font-size: 12px;
      color: var(--theme-primary-text-color-medium);
    }
    .location-progress {
      justify-content: flex-end;
      font-weight: bold;
      display: flex;
      margin-block-start: 0;
    }
  `;

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

  render() {
    return html`
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
              <etools-icon name="communication:locationOn"></etools-icon>
              ${this.topLevelLocation?.name}
            </p>
          </div>
          <div class="layout-horizontal">
            ${this.hasPD
              ? html`<div class="current-pd half">${this.currentPd.agreement} | ${this.currentPd.title}</div>`
              : ``}
            <div class="half">
              <dl class="location-progress">
                <dt>${translate('LOCATION_PROGRESS')}</dt>
                <dd>
                  ${this.topLevelLocation?.byEntity[0].display_type == 'number'
                    ? html`<etools-prp-number
                        .value="${this.topLevelLocation?.byEntity[0].location_progress.v}"
                      ></etools-prp-number>`
                    : html`<span
                        >${displayIndicatorValueFromatted(
                          this.topLevelLocation?.byEntity[0].display_type,
                          this.topLevelLocation?.byEntity[0].location_progress.c,
                          true
                        )}</span
                      >`}
                </dd>
              </dl>
            </div>
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
          this.onClose(true);
        })
        .catch((err: any) => {
          console.log(err);
          this.updatePending = false;
          fireEvent(this, 'toast', {
            text: err?.response?.non_field_errors?.[0] || getTranslation('ERROR_VERIFY_ENTERED_DATA'),
            showCloseBtn: true
          });
        });
    }
  }

  onClose(confirmed = false): void {
    fireEvent(this, 'dialog-closed', {confirmed: confirmed});
  }
}

export {DisaggregationModal as DisaggregationModalEl};
