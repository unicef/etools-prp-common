import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCell extends UtilsMixin(LitElement) {
   render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      ${this.editableBool ? html`<slot name="editable"></slot>` : 
        html` <span class="cellValue">
          ${this.noValue ? html`0` : html`<slot name="non-editable"></slot>`}          
        </span>`}
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean})
  editableBool!: boolean;

  @property({type: Boolean})
  noValue!: boolean;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('data')) {
      this.noValue = this._computeNoValue(this.data);
    }
  }
  
  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeNoValue(data: GenericObject) {
    return data ? !data.c && !data.d && !data.v : true;
  }
}

window.customElements.define('disaggregation-table-cell', DisaggregationTableCell);
