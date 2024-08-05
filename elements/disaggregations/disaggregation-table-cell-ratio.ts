import {html, css, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import UtilsMixin from '../../mixins/utils-mixin';
import './disaggregation-table-cell';
import './disaggregation-field';
import '../../elements/etools-prp-number';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
// import { IronMeta } from '@polymer/iron-meta/iron-meta'; // TODO check what is does

@customElement('disaggregation-table-cell-ratio')
class DisaggregationTableCellRatio extends UtilsMixin(LitElement) {
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

  static styles = [
    css`
      :host {
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
      }

      .item:not(:first-child) {
        border-left: 1px solid white;
      }

      .computed-value {
        grid-column: span 2;
        color: var(--theme-secondary-text-color);
      }
    `
  ];

  render() {
    return html`
      ${disaggregationTableStyles}
      <disaggregation-table-cell .data="${this.data}" .editable="${this.editable}">
        <div slot="editable" class="app-grid">
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
          <div class="computed-value">
            <etools-prp-number .value="${this.localData?.v}"></etools-prp-number> /
            <etools-prp-number .value="${this.localData?.d}"></etools-prp-number>
          </div>
        </div>
        <div slot="non-editable" class="app-grid">
          <div class="item">
            <etools-prp-number .value="${this.data?.v}"></etools-prp-number>
          </div>
          <div class="item">
            <etools-prp-number .value="${this.data?.d}"></etools-prp-number>
          </div>
          <div class="computed-value">
            <etools-prp-number .value="${this.data?.v}"></etools-prp-number> /
            <etools-prp-number .value="${this.data?.d}"></etools-prp-number>
          </div>
        </div>
      </disaggregation-table-cell>
    `;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('coords')) {
      this._bindValidation(this.coords);
    }
  }

  _handleInput(e: CustomEvent) {
    const key = e.detail.key;
    const value = e.detail.value;

    if (e.detail.internal) {
      // Dont handle self-fired events.
      return;
    }

    e.stopPropagation();

    const v = this.shadowRoot!.querySelector('#v') as EtoolsInput;
    const d = this.shadowRoot!.querySelector('#d') as EtoolsInput;

    const change = {...this.localData, ...value};

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

    ['v', 'd'].forEach((key) => {
      if (isNaN(change[key])) {
        delete change[key];
      }
    });

    this.localData = change;
  }

  _bindValidation(coords: string) {
    const vName = 'v-' + coords;
    // @dci
    // const validator = {
    //   validatorName: vName,
    //   validatorType: 'validator',
    //   validate: (value: string) => {
    //     return Number(value) !== 0 || Number((this.shadowRoot!.querySelector('#v') as EtoolsInput).value) === 0;
    //   }
    // };

    // What is this for?
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
    const nullData = this._clone(this.data);
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
}

export {DisaggregationTableCellRatio as DisaggregationTableCellRatioEl};
