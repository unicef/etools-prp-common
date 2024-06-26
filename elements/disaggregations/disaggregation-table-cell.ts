import { html, css, LitElement } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import UtilsMixin from '../../mixins/utils-mixin';
import { disaggregationTableStyles } from '../../styles/disaggregation-table-styles';
import { GenericObject } from '../../typings/globals.types';

@customElement('disaggregation-table-cell')
class DisaggregationTableCell extends UtilsMixin(LitElement) {
  @property({ type: Object })
  data!: GenericObject;

  @property({ type: Number })
  editable!: number;

  @property({ type: Boolean })
  editableBool!: boolean;

  @property({ type: Boolean })
  noValue!: boolean;

  static styles = [
    disaggregationTableStyles,
    css`
      :host {
        display: block;
      }
    `
  ];

  render() {
    return html`
      ${this.editableBool
      ? html`<slot name="editable"></slot>`
      : html`
            <span class="cellValue">
              ${this.noValue ? html`0` : html`<slot name="non-editable"></slot>`}
            </span>
          `}
    `;
  }

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

export default DisaggregationTableCell;
