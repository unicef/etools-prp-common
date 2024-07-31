import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import UtilsMixin from '../mixins/utils-mixin';
import './calculation-methods-demo-locations';
import './calculation-methods-demo-periods';
import './etools-prp-number';

/**
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('calculation-methods-demo-modal')
export class CalculationMethodsDemoModal extends UtilsMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        .content-box {
          padding: 20px;
          margin: 0 10px;
          background: var(--paper-grey-200);
        }

        .total-box {
          padding: 5px 5px 5px 50px;
          min-width: 75px;
          background: var(--paper-grey-400);
          text-align: end;
        }

        .bold-text {
          font-weight: bold;
          font-size: 1.17em;
        }

        .total-label {
          margin-right: 50px;
        }
        .m-10 {
          margin: 0 10px;
        }
        calculation-methods-demo-locations,
        calculation-methods-demo-periods {
          margin: 0 25px;
        }
        .pl-12 {
          padding-inline-start: 12px;
        }
      </style>

      <etools-dialog no-padding keep-dialog-open size="md" dialog-title="Calculation method across ${this.domain}">
        <div class="container-dialog">
          <div class="content-box">
            <labelled-item label="Sample indicator">
              <span class="bold-text">
                # of children aged 6-59 months affected by severe acute malnutrition who are admitted into treatment.
              </span>
            </labelled-item>

            <labelled-item label="Guidance on measurement (for each reporting period)">
              <span>
                Quality standard: requires agreed treatment protocol and duration (usually 2 mo); Measurement/reporting
                clarification: measures newly admitted cases for an ongoing service, therefore requires agreement to
                consistently report NEW admissions for an agreed reporting period (set dates) to avoid double counting.
              </span>
            </labelled-item>
          </div>

          <br />

          <labelled-item
            class="pl-12"
            label="Choose calculation method to read description
              and observe the impact on data presented below:"
          >
            <etools-radio-group @sl-change="${this._onRadioChange}" .value="${this.selectedType}">
              <sl-radio value="sum">SUM</sl-radio>
              <sl-radio value="max">MAX</sl-radio>
              <sl-radio value="avg">AVG</sl-radio>
            </etools-radio-group>
            <div>${this.description}</div>
          </labelled-item>

          <br />
          ${this._equals(this.domain, 'locations')
            ? html` <calculation-methods-demo-locations .totals="${this.locationTotals}">
              </calculation-methods-demo-locations>`
            : ``}
          ${this._equals(this.domain, 'reporting periods')
            ? html`
              <calculation-methods-demo-periods .totals="${this.locationTotals}">
                </calculation-methods-demo-locations>`
            : ``}

          <div class="content-box right-align m-10">
            <div class="total-label bold-text">Total progress:</div>
            <div class="total-box bold-text">
              <etools-prp-number .value="${this.finalTotal}"></etools-prp-number>
            </div>
          </div>

          <br />
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  domain!: string;

  @property({type: Number})
  items!: number;

  @property({type: String})
  selectedType = 'sum';

  @property({type: Array})
  totals = [
    {id: 1, value: 4000},
    {id: 2, value: 6000},
    {id: 3, value: 2000}
  ];

  @property({type: Array})
  locationTotals!: any[];

  @property({type: Number})
  finalTotal!: number | undefined;

  @property({type: Object})
  descriptionsLocations = {
    value: {
      sum:
        'Adds values as cumulative results for all locations. ' +
        'Answers the question, what is total coverage for reporting ' +
        'period across locations. Requires that indicator definition ' +
        'does not count same case or event twice across locations, i.e. ' +
        'reported values covering overlapping populations (e.g. for' +
        'estimated catchment population for mass dissemination by ' +
        'radio, total coverage must be calculated manually ' +
        'discounting overlap).',
      max:
        'Takes the top value for all locations. Answers the ' +
        'question, ' +
        'where is the  highest number of "x" reached at any one time. ' +
        'Useful for identification of pattern of demand.  Not generally ' +
        'a useful measure of overall performance of programme across ' +
        'locations.',
      avg:
        'Provides a measure of the typical value across the ' +
        'locations. Answers the question, how many people does a ' +
        'programme or service usually reach at any given location. ' +
        'Does not reflect the best or worst or total picture. '
    }
  };

  @property({type: Object})
  descriptionsReportingPeriods = {
    value: {
      sum:
        'Sum adds all results for all reporting periods. Answers the ' +
        'question: what is total coverage over time? Only valid ' +
        'indicator counts the same case or event only once over time ' +
        'e.g. sum of children admitted to SAM treatment (each child ' +
        'registered once at programme start) is valid. Not valid to ' +
        'aggregate sum of children participating in ongoing learning ' +
        'programme each month as this counts each child multiple times. ',
      max:
        'Max takes the top value for all reporting intervals. ' +
        'Answers the question: what was the peak case load or highest ' +
        'coverage at any one time?',
      avg:
        'Average provides a measure of the typical value across ' +
        'reporting periods. Answers the question: what is the usual ' +
        'reach/coverage in ongoing programme. '
    }
  };

  @property({type: String})
  description!: string;

  set dialogData(data: any) {
    const {domain, items}: any = data;

    this.domain = domain;
    this.items - items;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('selectedType') ||
      changedProperties.has('domain') ||
      changedProperties.has('descriptionsLocations') ||
      changedProperties.has('descriptionsReportingPeriods')
    ) {
      this.description = this._computeDescription(
        this.selectedType,
        this.domain,
        this.descriptionsLocations,
        this.descriptionsReportingPeriods
      );
    }
    if (changedProperties.has('totals') || changedProperties.has('items')) {
      this.locationTotals = this._computeTotals(this.totals, this.items);
    }
    if (changedProperties.has('totals') || changedProperties.has('items')) {
      this.finalTotal = this._computeFinalTotal(this.selectedType, this.locationTotals);
    }
  }

  _computeFinalTotal(selectedType: string, totals: any[]) {
    if (!totals) {
      return;
    }

    switch (selectedType) {
      case 'sum':
        return this._totalSum(totals);
      case 'max':
        return Math.max(
          ...totals.map(function (total) {
            return total.value;
          })
        );
      case 'avg':
        return this._totalAvg(totals);
      default:
        return this._totalSum(totals);
    }
  }

  _computeTotals(totals: any[], items: number) {
    return totals.slice(0, items);
  }

  _computeDescription(
    selectedType: string,
    domain: string,
    descriptionsLocations: any,
    descriptionsReportingPeriods: any
  ) {
    return domain === 'locations' ? descriptionsLocations[selectedType] : descriptionsReportingPeriods[selectedType];
  }

  _onRadioChange(e: CustomEvent) {
    this.selectedType = (e.target! as any).value;
  }

  _totalSum(data: any[]) {
    return data.reduce(function (acc, next) {
      return acc + next.value;
    }, 0);
  }

  _totalAvg(data: any[]) {
    return (
      data.reduce(function (acc, next) {
        return acc + next.value;
      }, 0) / data.length
    );
  }
}

export {CalculationMethodsDemoModal as CalculationMethodsDemoModalEl};
