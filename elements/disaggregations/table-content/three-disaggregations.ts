import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import UtilsMixin from '../../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import '../disaggregation-table-row';
import { GenericObject } from '@unicef-polymer/etools-utils/dist/types/global.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class ThreeDisaggregations extends DisaggregationMixin(UtilsMixin(LitElement)) {
  render() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
          ${this.columns.map((column: any) => html`<th>${this._capitalizeFirstLetter(column.value)}</th>`)}
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
       ${(this.outerRowsForDisplay || []).map((outerRow: any) =>
        html` <disaggregation-table-row
          .data="${outerRow}"
          .level-reported="${this.data.level_reported}"
          .indicator-type="${this.data.display_type}"
          row-type="outerRow"
        >
        </disaggregation-table-row>

        ${(this._determineMiddleRows(outerRow.id, this.columns, this.middleRows, this.data) || []).map((middleRow: any) =>
        html`<disaggregation-table-row
            .data="${middleRow}"
            .level-reported="${this.data.level_reported}"
            .indicator-type="${this.data.display_type}"
            row-type="middleRow"
            .editable="${this.editable}"
          >
          </disaggregation-table-row>`)}

       `)}
                  
      <!-- Totals row -->
      <disaggregation-table-row
        .data="${this.columnTotalRow}"
        .level-reported="${this.data.level_reported}"
        .indicator-type="${this.data.display_type}"
        row-type="totalsRow"
      >
      </disaggregation-table-row>

      <!-- Bottom table -->
       ${(this.bottomRows || []).map((bottomRow: any) =>
       html`<disaggregation-table-row
          .data="${bottomRow}"
          .level-reported="${this.data.level_reported}"
          .indicator-type="${this.data.display_type}"
          row-type="bottomRow"
        >
        </disaggregation-table-row>`)}
    `;
  }

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  columnTotalRow!: GenericObject;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Array})
  middleRows!: any[];

  @property({type: Array})
  outerRowsForDisplay!: any[];

  
  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
      this.middleRows = this._getMiddleRows(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('rows')) {
      this.outerRowsForDisplay = this._determineOuterRows(this.columns, this.rows);
    }
    if (changedProperties.has('columns') || changedProperties.has('middleRows') || changedProperties.has('data')) {
      this._determineTotals(this.columns, this.middleRows, this.data)
    }    
  }

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || []).choices;
  }

  _getMiddleRows(mapping: any[]) {
    return (mapping[2] || []).choices;
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
      }, this);

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
    }, this);
  }

  _determineTotals(columns: any[], middleRows: any[], data: GenericObject) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    }, this);

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

window.customElements.define('three-disaggregations', ThreeDisaggregations);
