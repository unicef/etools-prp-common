import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import '../disaggregation-table-row';
import {capitalizeFirstLetter} from '@unicef-polymer/etools-utils/dist/general.util';

/**
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
@customElement('three-disaggregations')
class ThreeDisaggregations extends DisaggregationMixin(LitElement) {
  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: any;

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  columnTotalRow!: any;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Array})
  middleRows!: any[];

  @property({type: Array})
  outerRowsForDisplay!: any[];

  @property({type: Array})
  bottomRows!: any[];

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        ${layoutStyles}
      </style>

      ${disaggregationTableStyles}
      <!-- Column names -->
      <tr class="layout-horizontal headerRow">
        <th></th>
        ${(this.columns || []).map((column) => html`<th>${capitalizeFirstLetter(column.value)}</th>`)}
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      ${(this.outerRowsForDisplay || []).map(
        (outerRow) => html`
          <disaggregation-table-row
            .data="${outerRow}"
            .levelReported="${this.data?.level_reported}"
            .indicatorType="${this.data?.display_type}"
            rowType="outerRow"
          ></disaggregation-table-row>

          ${(this._determineMiddleRows(outerRow.id, this.columns, this.middleRows, this.data) || []).map(
            (middleRow) => html`
              <disaggregation-table-row
                .data="${middleRow}"
                .levelReported="${this.data?.level_reported}"
                .indicatorType="${this.data?.display_type}"
                rowType="middleRow"
                .editable="${this.editable}"
              ></disaggregation-table-row>
            `
          )}
        `
      )}

      <!-- Totals row -->
      <disaggregation-table-row
        .data="${this.columnTotalRow}"
        .levelReported="${this.data?.level_reported}"
        .indicatorType="${this.data?.display_type}"
        rowType="totalsRow"
      ></disaggregation-table-row>

      <!-- Bottom table -->
      ${(this.bottomRows || []).map(
        (bottomRow) => html`
          <disaggregation-table-row
            .data="${bottomRow}"
            .levelReported="${this.data?.level_reported}"
            .indicatorType="${this.data?.display_type}"
            rowType="bottomRow"
          ></disaggregation-table-row>
        `
      )}
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
      this.middleRows = this._getMiddleRows(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('middleRows') || changedProperties.has('data')) {
      this._determineTotals(this.columns, this.middleRows, this.data);
    }
    if (changedProperties.has('columns') || changedProperties.has('rows') || changedProperties.has('data')) {
      this.outerRowsForDisplay = this._determineOuterRows(this.rows, this.columns);
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

  _determineOuterRows(rows: any[], columns: any[]) {
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(outerRowID: number, columns: any[], middleRows: any[], data: any) {
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

  _determineTotals(columns: any[], middleRows: any[], data: any) {
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
        data: data?.disaggregation?.['()']
      }
    };

    this.columnTotalRow = columnTotalRow;
    this.bottomRows = this._determineRows(this, middleRows, columns);
  }
}

export default ThreeDisaggregations;
