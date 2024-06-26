import {LitElement, PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/app-layout/app-grid/app-grid-style';
import UtilsMixin from '../../mixins/utils-mixin';
import '../../elements/etools-prp-number';
import './disaggregation-field';
import {DisaggregationFieldEl} from './disaggregation-field';
import {disaggregationTableStyles} from '../../styles/disaggregation-table-styles';
import {GenericObject} from '../../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@polymer/iron-meta/iron-meta';
import {IronMeta} from '@polymer/iron-meta/iron-meta';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@polymer/polymer/lib/elements/dom-if';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellPercentage extends UtilsMixin(LitElement) {
   render() {
    // language=HTML
    return html`
      ${disaggregationTableStyles}
      <style include="app-grid-style">
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
          @apply --app-grid-expandible-item;

          color: var(--theme-secondary-text-color);
        }

        .app-grid,
        .cellValue {
          width: 100%;
        }
      </style>

      ${this.editable ? html`<div class="app-grid">
          <div class="item">
            <disaggregation-field id="v" key="v" min="0" .value="${this.data?.v}" .coords="${this.coords}"> </disaggregation-field>
          </div>
          <div class="item">
            <disaggregation-field id="d" key="d" min="0" .value="${this.data?.d}" coords="${this.coords}" .validator="${this.vName}">
            </disaggregation-field>
          </div>
          <div class="computed-value">${this._toPercentage(this.data?.c)}</div>
        </div>` : ``}
        
        ${this.isNotEditableAndValue(this.editable, this.data) ? html`<div class="app-grid">
          <div class="item">
            <etools-prp-number .value="${this.data.v}"></etools-prp-number>
          </div>
          <div class="item">
            <etools-prp-number .value="${this.data.d}"></etools-prp-number>
          </div>
          <div class="computed-value">${this._toPercentage(this.data.c)}</div>
        </div>` : ``}
        
      ${this.isNotEditableAndNoValue(this.editable, this.data) ? html`<div class="cellValue">0</div>` : ``}

    `;
  }

  @property({type: String})
  vName!: string;

  @property({type: Number})
  editable!: number;

  @property({type: Object})
  localData!: GenericObject;

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  coords!: string;

  noValue(data: GenericObject) {
    return data ? !data.c && !data.d && !data.v : true;
  }

  isNotEditableAndNoValue(editable, data) {
    return !editable && this.noValue(data);
  }

  isNotEditableAndValue(editable, data) {
    return !editable && !this.noValue(data);
  }

  
  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('data')) {
      this._cloneData(this.data);
    }
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

    const v = this.shadowRoot!.querySelector('#v') as DisaggregationFieldEl;
    const d = this.shadowRoot!.querySelector('#d') as DisaggregationFieldEl;

    if (!v || !d) {
      return;
    }

    const change = Object.assign({}, this.get('localData'), value);

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

    this.set('localData', change);
  }

  _bindValidation(coords: string) {
    const vName = 'v-' + coords;
    const validator = {
      validatorName: vName,
      validatorType: 'validator',
      validate: (value: string) => {
        return (
          Number(value) !== 0 ||
          Number(
            ((this!.shadowRoot!.querySelector('#v') as DisaggregationFieldEl).getField() as EtoolsInput).value
          ) === 0
        );
      }
    };

    new IronMeta({
      type: validator.validatorType,
      key: validator.validatorName,
      value: validator
    });

    this.set('vName', vName);
  }

  _cloneData(data: GenericObject) {
    if (!this.localData) {
      this.set('localData', this._clone(data));
    }
  }

  _addEventListeners() {
    this._handleInput = this._handleInput.bind(this);
    this.addEventListener('field-value-changed', this._handleInput as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
    const nullData = this._clone(this.data);
    this.set('data', nullData);
  }

  _removeEventListeners() {
    this.removeEventListener('field-value-changed', this._handleInput as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }
}

window.customElements.define('disaggregation-table-cell-percentage', DisaggregationTableCellPercentage);
