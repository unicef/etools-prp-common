import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import '../disaggregation-table-row';

@customElement('zero-disaggregations')
class ZeroDisaggregations extends LitElement {
  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  mapping!: any;

  @property({type: Object})
  totalRow!: any;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>

      ${disaggregationTableStyles}
      <disaggregation-table-row
        .data="${this.totalRow}"
        .levelReported="${this.data?.level_reported}"
        .indicatorType="${this.data?.display_type}"
        rowType="totalsRow"
        .editable="${this.editable}"
      ></disaggregation-table-row>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('mapping') || changedProperties.has('data')) {
      this.totalRow = this._determineTotalRow(this.data);
    }
  }

  _determineTotalRow(data: any) {
    return {
      title: 'total',
      total: {
        key: '()',
        data: data?.disaggregation?.['()']
      }
    };
  }
}

export default ZeroDisaggregations;
