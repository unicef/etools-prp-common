import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import UtilsMixin from '../../../mixins/utils-mixin';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import { disaggregationTableStyles } from '../../../styles/disaggregation-table-styles';
import { GenericObject } from '../../../typings/globals.types';
import '../disaggregation-table-row';

/**
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
@customElement('one-disaggregation')
class OneDisaggregation extends DisaggregationMixin(UtilsMixin(LitElement)) {
  @property({ type: Number })
  editable!: number;

  @property({ type: Object })
  data!: GenericObject;

  @property({ type: Array })
  mapping!: any[];

  @property({ type: Array })
  totalRow!: any[];

  @property({ type: Array })
  columns!: any[];

  @property({ type: Array })
  rows!: any[];

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
      <table>
        <tr class="horizontal layout headerRow">
          <th></th>
          <th>Total</th>
        </tr>

        ${this.rows.map(
      (row) => html`
            <disaggregation-table-row
              .data="${row}"
              .levelReported="${this.data.level_reported}"
              .indicatorType="${this.data.display_type}"
              row-type="middleRow"
              .editable="${this.editable}"
            ></disaggregation-table-row>
          `
    )}

        <disaggregation-table-row
          .data="${this.totalRow}"
          .levelReported="${this.data.level_reported}"
          .indicatorType="${this.data.display_type}"
          row-type="totalsRow"
        ></disaggregation-table-row>
      </table>
    `;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('data') || changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._determineRows(this.columns, this.data);
      this.totalRow = this._determineTotalRow(this.data);
    }
  }

  _getColumns(mapping: any[]) {
    return (mapping[0] || {}).choices || [];
  }

  _determineTotalRow(data: GenericObject) {
    return {
      title: 'total',
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };
  }

  _determineRows(columns: any[], data: GenericObject) {
    return columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);
      return {
        title: z.value,
        data: [
          {
            key: formatted,
            data: data.disaggregation[formatted]
          }
        ]
      };
    });
  }
}
