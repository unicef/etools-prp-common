import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import {disaggregationTableStyles} from '../../../styles/disaggregation-table-styles';
import {GenericObject} from '../../../typings/globals.types';
import '../disaggregation-table-row';

/**
 * @polymer
 * @customElement
 */
class ZeroDisaggregations extends LitElement {
  render() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <disaggregation-table-row
        .data="${this.totalRow}"
        .level-reported="${this.data.level_reported}"
        .indicator-type="${this.data.display_type}"
        row-type="totalsRow"
        .editable="${this.editable}"
      >
      </disaggregation-table-row>
    `;
  }

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  totalRow!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('config')) {
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

window.customElements.define('zero-disaggregations', ZeroDisaggregations);
