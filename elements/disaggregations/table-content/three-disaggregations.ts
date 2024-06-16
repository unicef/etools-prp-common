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
@customElement('three-disaggregations')
class ThreeDisaggregations extends DisaggregationMixin(UtilsMixin(LitElement)) {
  @property({ type: Number })
  editable!: number;

  @property({ type: Object })
  data!: GenericObject;

  @property({ type: Array })
  mapping!: any[];

  @property({ type: Object })
  columnTotalRow!: GenericObject;

  @property({ type: Array })
  columns!: any[];

  @property({ type: Array })
  rows!: any[];

  @property({ type: Array })
  middleRows!: any[];

  @property({ type: Array })
  outerRowsForDisplay!: any[];

  @property({ type: Array })
  bottomRows!: any[];

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
        <!-- Column names -->
        <tr class="horizontal layout headerRow">
          <th></th>
          ${this.columns.map(
      (column) => html`<th>${this._capitalizeFirstLetter(column.value)}</th>`
    )}
          <th>Total</th>
        </tr>

        <!-- Data rows: outer and middle. -->
        ${this.outerRowsForDisplay.map(
      (outerRow) => html`
            <disaggregation-table-row
              .data="${outerRow}"
              .levelReported="${this.data.level_reported}"
              .indicatorType="${this.data.display_type}"
              row-type="outerRow"
            ></disaggregation-table-row>

            ${this._determineMiddleRows(outerRow.id, this.columns, this.middleRows, this.data).map(
        (middleRow) => html`
                <disaggregation-table-row
                  .data="${middleRow}"
                  .levelReported="${this.data.level_reported}"
                  .indicatorType="${this.data.display_type}"
                  row-type="middleRow"
                  .editable="${this.editable}"
                ></disaggregation-table-row>
              `
      )}
          `
    )}

        <!-- Totals row -->
        <disaggregation-table-row
          .data="${this.columnTotalRow}"
          .levelReported="${this.data.level_reported}"
          .indicatorType="${this.data.display_type}"
          row-type="totalsRow"
        ></disaggregation-table-row>

        <!-- Bottom table -->
        ${this.bottomRows.map(
      (bottomRow) => html`
            <disaggregation-table-row
              .data="${bottomRow}"
              .levelReported="${this.data.level_reported}"
              .indicatorType="${this.data.display_type}"
              row-type="bottomRow"
            ></disaggregation-table-row>
          `
    )}
      </table>
    `;
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('data') || changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
      this.middleRows = this._getMiddleRows(this.mapping);
      this.outerRowsForDisplay = this._determineOuterRows(this.columns, this.rows, this.data);
      this._determineTotals(this.columns, this.middleRows, this.data);
    }
  }

  _getColumns(mapping: any[]) {
    return (mapping[0] || {}).choices || [];
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || {}).choices || [];
  }

  _getMiddleRows(mapping: any[]) {
    return (mapping[2] || {}).choices || [];
  }

  _determineOuterRows(columns: any[], rows: any[]) {
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(outerRowID: number, columns: any[], middleRows: any[], data: GenericObject) {
    if (!columns || !middleRows) {
      return [];
    }
    return middleRows.map((y) => {
      let formatted;

      const columnData = columns.map((z) => {
        formatted = this._formatDisaggregationIds([outerRowID, y.id, z.id]);

        return {
          key: formatted,
          data: data.disaggregation[formatted]
        };
      });

      formatted = this._formatDisaggregationIds([outerRowID, y.id]);

      return {
        title: y.value,
        data: columnData,
        id: y.id,
        total: {
          key: formatted,
          data: data.disaggregation[formatted]
        }
      };
    });
  }

  _determineTotals(columns: any[], middleRows: any[], data: GenericObject) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    });

    const columnTotalRow = {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };

    this.columnTotalRow = columnTotalRow;
    this.bottomRows = this._determineRows(this, middleRows, columns);
  }
}

export default ThreeDisaggregations;
