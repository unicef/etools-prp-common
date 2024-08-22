import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import './disaggregation-table-cell';
import './disaggregation-field';
import '../../elements/etools-prp-number';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';

@customElement('disaggregation-table-cell-number')
class DisaggregationTableCellNumber extends UtilsMixin(LitElement) {
  @property({type: Object})
  data!: any;

  @property({type: String})
  coords!: string;

  @property({type: Number})
  editable!: number;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      ${disaggregationTableStyles}
      <disaggregation-table-cell .data="${this.data}" .editable="${this.editable}">
        ${this.editable
          ? html`
              <disaggregation-field
                slot="editable"
                key="v"
                .value="${this.data?.v}"
                .coords="${this.coords}"
              ></disaggregation-field>
            `
          : html` <etools-prp-number slot="non-editable" .value="${this.data?.v}"></etools-prp-number> `}
      </disaggregation-table-cell>
    `;
  }
}

export {DisaggregationTableCellNumber as DisaggregationTableCellNumberEl};
