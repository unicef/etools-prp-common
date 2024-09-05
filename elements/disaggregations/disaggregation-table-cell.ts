import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';

@customElement('disaggregation-table-cell')
class DisaggregationTableCell extends UtilsMixin(LitElement) {
  @property({type: Object})
  data!: any;

  @property({type: Number})
  editable!: number;

  @property({type: Boolean})
  editableBool!: boolean;

  @property({type: Boolean})
  noValue!: boolean;

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      ${disaggregationTableStyles}
      ${this.editableBool
        ? html`<slot name="editable"></slot>`
        : html` <span class="cellValue"> ${this.noValue ? html`0` : html`<slot name="non-editable"></slot>`} </span> `}
    `;
  }

  updated(changedProperties): void {
    super.updated(changedProperties);

    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('data')) {
      this.noValue = this._computeNoValue(this.data);
      this.requestUpdate();
    }
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeNoValue(data: any) {
    return data ? !data.c && !data.d && !data.v : true;
  }
}

export default DisaggregationTableCell;
