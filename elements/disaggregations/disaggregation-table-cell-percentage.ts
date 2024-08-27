import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../../elements/etools-prp-number';
import './disaggregation-field';
import {DisaggregationFieldEl} from './disaggregation-field';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

@customElement('disaggregation-table-cell-percentage')
class DisaggregationTableCellPercentage extends LitElement {
  @property({type: String})
  vName!: string;

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  localData!: any;

  @property({type: Object})
  data!: any;

  @property({type: String})
  coords!: string;

  render() {
    return html`
      <style>
        ${layoutStyles} :host {
          display: block;
        }

        .item,
        .computed-value {
          box-sizing: border-box;
          min-height: 25px;
          line-height: 25px;
        }

        .item {
          padding: 0;
          border-bottom: 1px solid white;
          white-space: nowrap;
          width: 50%;
        }

        .item:not(:first-child) {
          border-left: 1px solid white;
        }

        .computed-value {
          grid-column: span 2;
          color: var(--theme-secondary-text-color);
        }

        .app-grid,
        .cellValue {
          width: 100%;
        }
      </style>
      ${disaggregationTableStyles}
      ${this.editable
        ? html`
            <div class="app-grid">
              <div class="layout-horizontal item-parent">
                <div class="item item-v">
                  <disaggregation-field
                    id="v"
                    key="v"
                    min="0"
                    .value="${this.data?.v}"
                    .coords="${this.coords}"
                  ></disaggregation-field>
                </div>
                <div class="item item-d">
                  <disaggregation-field
                    id="d"
                    key="d"
                    min="0"
                    .value="${this.data?.d}"
                    .coords="${this.coords}"
                    validate-sibling
                  ></disaggregation-field>
                </div>
              </div>
              <div class="computed-value">${this._toPercentage(this.data?.c)}</div>
            </div>
          `
        : html`
            ${this.isNotEditableAndValue(this.editable, this.data)
              ? html`
                  <div class="app-grid">
                    <div class="layout-horizontal">
                      <div class="item">
                        <etools-prp-number .value="${this.data?.v}"></etools-prp-number>
                      </div>
                      <div class="item">
                        <etools-prp-number .value="${this.data?.d}"></etools-prp-number>
                      </div>
                    </div>
                    <div class="computed-value">${this._toPercentage(this.data?.c)}</div>
                  </div>
                `
              : html` <div class="cellValue">0</div> `}
          `}
    `;
  }

  noValue(data: any) {
    return data ? !data.c && !data.d && !data.v : true;
  }

  isNotEditableAndNoValue(editable: number, data: any) {
    return !editable && this.noValue(data);
  }

  isNotEditableAndValue(editable: number, data: any) {
    return !editable && !this.noValue(data);
  }

  _handleInput(e: CustomEvent) {
    const key = e.detail.key;
    const value = e.detail.value;

    if (e.detail.internal) {
      // Dont handle self-fired events.
      return;
    }

    e.stopPropagation();

    const v = this.shadowRoot!.querySelector('#v') as DisaggregationFieldEl;
    const d = this.shadowRoot!.querySelector('#d') as DisaggregationFieldEl;

    if (!v || !d) {
      return;
    }

    const change = {...this.localData, ...value};

    if (e.detail.isSettingDefault) {
      // used by setting default with 0
      change.c = 0;
      fireEvent(this, 'field-value-changed', {
        key: key,
        value: change,
        internal: true
      });
    } else {
      if (!v.validate() || !d.validate()) {
        change.c = null;
      } else {
        change.c = change.d === 0 ? 0 : change.v / change.d;

        fireEvent(this, 'field-value-changed', {
          key: key,
          value: change,
          internal: true
        });
      }
    }

    this.localData = change;
  }

  _cloneData(data: any) {
    if (!this.localData) {
      this.localData = {...data};
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    const nullData = {...this.data};
    this.data = nullData;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

  _addEventListeners() {
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field-value-changed', this._handleInput as any);
  }

  _removeEventListeners() {
    this.removeEventListener('field-value-changed', this._handleInput as any);
  }

  _toPercentage(value: number | null): string {
    return value != null ? `${Math.floor(value * 100)}%` : '0%';
  }
}

export {DisaggregationTableCellPercentage as DisaggregationTableCellPercentageEl};
