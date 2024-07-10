import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
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

  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`
      ${disaggregationTableStyles}
      <disaggregation-table-row
        .data="${this.totalRow}"
        .levelReported="${this.data?.level_reported}"
        .indicatorType="${this.data?.display_type}"
        row-type="totalsRow"
        .editable="${this.editable}"
      ></disaggregation-table-row>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('mapping') || changedProperties.has('data')) {
      console.log('this.data', this.data);
      this.totalRow = this._determineTotalRow(this.data);
    }
  }

  _determineTotalRow(data: any) {
    console.log('datadata', data);
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
