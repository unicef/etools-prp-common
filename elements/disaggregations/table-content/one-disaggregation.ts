import {LitElement, html, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import UtilsMixin from '../../../mixins/utils-mixin';
import DisaggregationMixin from '../../../mixins/disaggregations-mixin';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import '../disaggregation-table-row';

/**
 * @customElement
 * @appliesMixin DisaggregationMixin
 * @appliesMixin UtilsMixin
 */
@customElement('one-disaggregation')
export class OneDisaggregation extends DisaggregationMixin(UtilsMixin(LitElement)) {
  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: any;

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  totalRow!: any;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  static styles = [
    layoutStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`
      ${disaggregationTableStyles}

      <tr class="layout-horizontal headerRow">
        <th></th>
        <th>Total</th>
      </tr>

      ${(this.rows || []).map(
        (row) => html`
          <disaggregation-table-row
            .data="${row}"
            .levelReported="${this.data?.level_reported}"
            .indicatorType="${this.data?.display_type}"
            row-type="middleRow"
            .editable="${this.editable}"
          ></disaggregation-table-row>
        `
      )}

      <disaggregation-table-row
        .data="${this.totalRow}"
        .levelReported="${this.data?.level_reported}"
        .indicatorType="${this.data?.display_type}"
        row-type="totalsRow"
      ></disaggregation-table-row>
    `;
  }

  _getColumns(mapping: any[]) {
    return (mapping[0] || {}).choices || [];
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

  _determineTotalRow(data: any) {
    return {
      title: 'total',
      total: {
        key: '', // unused
        data: data?.disaggregation?.['()']
      }
    };
  }

  _determineRows(columns: any[], data: any) {
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
