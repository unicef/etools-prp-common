import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { disaggregationTableStyles } from '../../../styles/disaggregation-table-styles';
import { GenericObject } from '../../../typings/globals.types';
import '../disaggregation-table-row';

@customElement('zero-disaggregations')
class ZeroDisaggregations extends LitElement {
  @property({ type: Number })
  editable!: number;

  @property({ type: Object })
  data!: GenericObject;

  @property({ type: Object })
  totalRow!: GenericObject;

  static styles = [
    disaggregationTableStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`
      <disaggregation-table-row
        .data="${this.totalRow}"
        .levelReported="${this.data.level_reported}"
        .indicatorType="${this.data.display_type}"
        row-type="totalsRow"
        .editable="${this.editable}"
      ></disaggregation-table-row>
    `;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('data')) {
      this.totalRow = this._determineTotalRow(this.data);
    }
  }

  _determineTotalRow(data: GenericObject) {
    return {
      title: 'total',
      total: {
        key: '()',
        data: data.disaggregation['()']
      }
    };
  }
}

export default ZeroDisaggregations;
