import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import './disaggregation-table-cell';
import './disaggregation-field';
import '../../elements/etools-prp-number';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellNumber extends UtilsMixin(LitElement) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>

      <disaggregation-table-cell .data="${this.data}" .editable="${this.editable}">
      ${this.editable ? 
        html`<disaggregation-field slot="editable" key="v" .value="${this.data.v}" coords="${this.coords}"></disaggregation-field>` : 
        html`<etools-prp-number slot="non-editable" .value="${this.data.v}"></etools-prp-number>`}      
      </disaggregation-table-cell>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  coords!: string;

  @property({type: Number})
  editable!: number;

  connectedCallback() {
    super.connectedCallback();
    const nullData = this._clone(this.data);
    this.data = nullData;
  }
}

window.customElements.define('disaggregation-table-cell-number', DisaggregationTableCellNumber);
