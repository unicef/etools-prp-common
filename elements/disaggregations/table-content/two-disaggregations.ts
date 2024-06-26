import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import {GenericObject} from '../../../typings/globals.types';
import '../disaggregation-table-row';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class TwoDisaggregations extends UtilsMixin(DisaggregationMixin(LitElement)) {
   render() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class="horizontal layout headerRow">
        <th></th>

        ${(this.columns || []).map((column: any) => html`<th>${this._capitalizeFirstLetter(column.value)}</th>`)}
        <th>Total</th>
      </tr>

        ${(this.rowsForDisplay || []).map((row: any) => html`
          <disaggregation-table-row
          .data="${row}"
          .level-reported="${this.data.level_reported}"
          .indicator-type="${this.data.display_type}"
          row-type="middleRow"
          .editable="${this.editable}"
        >
        </disaggregation-table-row>`)}

      <disaggregation-table-row
        .data="${this.totalsForDisplay}"
        .level-reported="${this.data.level_reported}"
        .indicator-type="${this.data.display_type}"
        row-type="totalsRow"
      >
      </disaggregation-table-row>
    `;
  }

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Object})
  totalsForDisplay!: GenericObject;

  @property({type: Object})
  rowsForDisplay!: GenericObject;

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
      this.rowsForDisplay = this._determineRowsForDisplay(this.columns, this.rows);
    }
  }
  

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any[]) {
    return (mapping[1] || []).choices;
  }

  _determineRowsForDisplay(columns: any[], rows: any[]) {
    return this._determineRows(this, rows, columns);
  }

  _determineTotals(columns: any[], data: GenericObject) {
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    }, this);

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

window.customElements.define('two-disaggregations', TwoDisaggregations);
