import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@unicef-polymer/etools-data-table/etools-data-table';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';
import './disaggregation-table-cell-number';
import './disaggregation-table-cell-percentage';
import './disaggregation-table-cell-ratio';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableRow extends UtilsMixin(LocalizeMixin(LitElement)) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style></style>

      <tr class$="${this._computeClass(this.rowType)}">
        <td class="cellTitle">
          <span class="cellValue">${this._capitalizeFirstLetter(this.data.title)}</span>
        </td>
        ${(this.data?.data || []).map((item: any) => html`
          <td>
          ${this._equals(this.indicatorType, 'number') ? 
              html`<disaggregation-table-cell-number .coords="${item.key}" .data="${item.data}" ?editable="${this.editable}">
              </disaggregation-table-cell-number>`: ``}
            
          ${this._equals(this.indicatorType, 'percentage') ? 
            html`<disaggregation-table-cell-percentage .coords="${item.key}" .data="${item.data}" ?editable="${this.editable}">
              </disaggregation-table-cell-percentage>`: ``}

          ${this._equals(this.indicatorType, 'ratio') ? 
            html`<disaggregation-table-cell-ratio .coords="${item.key}" .data="${item.data}" .editable="${this.editable}">
              </disaggregation-table-cell-ratio>`: ``}
          </td>
          `)}
          ${this.data?.total ? html`            
          <td class="cellTotal">
            ${this._equals(this.indicatorType, 'number') ? 
              html`<disaggregation-table-cell-number .coords="${this.data.total.key}" .data="${this.data.total.data}" ?editable="${this.totalEditable}">
              </disaggregation-table-cell-number>`: ``}

            ${this._equals(this.indicatorType, 'percentage') ? 
              html`<disaggregation-table-cell-percentage .coords="${this.data.total.key}" .data="${this.data.total.data}" ?editable="${this.totalEditable}">
              </disaggregation-table-cell-percentage>`: ``}

            ${this._equals(this.indicatorType, 'ratio') ? 
              html`<disaggregation-table-cell-ratio .coords="${this.data.total.key}" .data="${this.data.total.data}" ?editable="${this.totalEditable}">
              </disaggregation-table-cell-ratio>`: ``}            
          </td>`: ``}             
      </tr>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Number})
  levelReported!: number;

  @property({type: String})
  indicatorType!: string;

  @property({type: String})
  rowType!: string;

  @property({type: Number})
  editable = 0;

  @property({type: Number})
  totalEditable = 0;

  _computeClass(rowType: string) {
    return rowType;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('data') || changedProperties.has('levelReported') || changedProperties.has('editable')) {
      this._setTotalEditable(this.data.total.key, this.levelReported, this.editable);
    }
  }
  

  _setTotalEditable(coords: string, levelReported: number, editable: number) {
    this.totalEditable = coords === '()' && levelReported === 0 ? editable : 0;
  }
}

window.customElements.define('disaggregation-table-row', DisaggregationTableRow);
