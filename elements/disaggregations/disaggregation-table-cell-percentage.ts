import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '../../elements/etools-prp-number';
import './disaggregation-field';
import {DisaggregationFieldEl} from './disaggregation-field';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
// import '@polymer/iron-meta/iron-meta';
// import {IronMeta} from '@polymer/iron-meta/iron-meta'; // TODO check what is does

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
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 0px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
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
              <div class="item">
                <disaggregation-field
                  id="v"
                  key="v"
                  min="0"
                  .value="${this.data?.v}"
                  .coords="${this.coords}"
                ></disaggregation-field>
              </div>
              <div class="item">
                <disaggregation-field
                  id="d"
                  key="d"
                  min="0"
                  .value="${this.data?.d}"
                  .coords="${this.coords}"
                  .validator="${this.vName}"
                ></disaggregation-field>
              </div>
              <div class="computed-value">${this._toPercentage(this.data?.c)}</div>
            </div>
          `
        : html`
            ${this.isNotEditableAndValue(this.editable, this.data)
              ? html`
                  <div class="app-grid">
                    <div class="item">
                      <etools-prp-number .value="${this.data?.v}"></etools-prp-number>
                    </div>
                    <div class="item">
                      <etools-prp-number .value="${this.data?.d}"></etools-prp-number>
                    </div>
                    <div class="computed-value">${this._toPercentage(this.data?.c)}</div>
                  </div>
                `
              : html` <div class="cellValue">0</div> `}
          `}
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('coords')) {
      this._bindValidation(this.coords);
    }
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

    if (!d.validate() || !v.validate()) {
      change.c = null;
    } else {
      change.c = change.d === 0 ? 0 : change.v / change.d;

      fireEvent(this, 'field-value-changed', {
        key: key,
        value: change,
        internal: true
      });
    }

    this.localData = change;
  }

  _bindValidation(coords: string) {
    const vName = 'v-' + coords;
    // @dci
    // const validator = {
    //   validatorName: vName,
    //   validatorType: 'validator',
    //   validate: (value: string) => {
    //     return (
    //       Number(value) !== 0 ||
    //       Number((this.shadowRoot!.querySelector('#v') as DisaggregationFieldEl).getField() as EtoolsInput) === 0
    //     );
    //   }
    // };

    // new IronMeta({
    //   type: validator.validatorType,
    //   key: validator.validatorName,
    //   value: validator
    // });

    this.vName = vName;
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
