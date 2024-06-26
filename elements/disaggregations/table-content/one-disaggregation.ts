import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import UtilsMixin from '../../../mixins/utils-mixin';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import {GenericObject} from '../../../typings/globals.types';
import '../disaggregation-table-row';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
class OneDisaggregation extends DisaggregationMixin(UtilsMixin(LitElement)) {
   render() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class="horizontal layout headerRow">
        <th></th>
        <th>Total</th>
      </tr>

      ${this.rows.map((row: any) => {
        html`
        <disaggregation-table-row
        .data="${row}"
        .level-reported="${this.data.level_reported}"
        .indicator-type="${this.data.display_type}"
        row-type="middleRow"
        .editable="${this.editable}"
      >
      </disaggregation-table-row>`
      })}

      <disaggregation-table-row
        .data="${this.totalRow}"
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
  totalRow!: GenericObject;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  _getColumns(mapping: any[]) {
    return (mapping[0] || []).choices;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('data')) {
      this.totalRow = this._determineTotalRow(this.data);
    }
    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('data')) {
      this.totalRow = this._determineRows(this.columns, this.data);
    }
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
    }, this);
  }
}

window.customElements.define('one-disaggregation', OneDisaggregation);
