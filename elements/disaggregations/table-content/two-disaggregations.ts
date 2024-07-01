import { LitElement, html, css, PropertyValues } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import '../disaggregation-table-row';

/**
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
@customElement('two-disaggregations')
class TwoDisaggregations extends DisaggregationMixin(UtilsMixin(LitElement)) {
  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: any;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Object})
  totalsForDisplay!: any;

  @property({type: Array})
  rowsForDisplay!: any[];

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
      <table>
        <tr class="horizontal layout headerRow">
          <th></th>
          ${(this.columns || []).map((column) => html`<th>${this._capitalizeFirstLetter(column.value)}</th>`)}
          <th>Total</th>
        </tr>

        ${(this.rowsForDisplay || []).map(
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
          .data="${this.totalsForDisplay}"
          .levelReported="${this.data.level_reported}"
          .indicatorType="${this.data.display_type}"
          row-type="totalsRow"
        ></disaggregation-table-row>
      </table>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('data')) {
      this.totalsForDisplay = this._determineTotals(this.columns, this.data);
    }
    if (changedProperties.has('columns') || changedProperties.has('rows') || changedProperties.has('data')) {
      this.rowsForDisplay = this._determineRowsForDisplay(this.columns, this.rows, this.data);
    }
  }

  _getColumns(mapping: any[]) {
    return (mapping[0] || {}).choices || [];
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || {}).choices || [];
  }

  _determineRowsForDisplay(columns: any[], rows: any[], _data: any) {
    return this._determineRows(this, rows, columns);
  }

  _determineTotals(columns: any[], data: any) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    });

    return {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused,
        data: data.disaggregation['()']
      }
    };
  }
}

export default TwoDisaggregations;
