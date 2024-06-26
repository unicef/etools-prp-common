import {PropertyValues, html} from 'lit';
import {property} from 'lit/decorators.js';
import '@polymer/iron-ajax/iron-ajax';
import {IronAjaxElement} from '@polymer/iron-ajax/iron-ajax';
import UtilsMixin from '../mixins/utils-mixin';
import {GenericObject} from '../typings/globals.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {setToken, resetToken} from '../../redux/actions';
import LocalizeMixin from '../mixins/localize-mixin';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import { store } from '../../redux/store';
import { RootState } from '../../typings/redux.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class EtoolsPrpAjax extends connect(store)(LocalizeMixin(UtilsMixin)) {
  render() {
    return html`
      <iron-ajax
        id="ajax"
        bubbles
        ?auto="${this.auto}"
        .method="${this.formattedMethod}"
        .content-type="${this.contentType}"
        .url="${this.url}"
        .body="${this.body}"
        .params="${this.params}"
        .headers="${this.customHeaders}"
        .timeout="${this.timeout}"
        .handle-as="${this.handleAs}"
        .json-prefix="${this.jsonPrefix}"
        .sync="${this.sync}"
        ?withCredentials="${this.withCredentials}"
        ?loading="${this.loading}"
        .active-requests="${this.activeRequests}"
        .debounce-duration="${this.debounceDuration}"
        .last-error="${this.lastError}"
        .last-request="${this.lastRequest}"
        .last-response="${this.lastResponse}"
      >
      </iron-ajax>
    `;
  }

  @property({type: String})
  method!: string;

  @property({type: String})
  contentType!: string;

  @property({type: String})
  url!: string;

  @property({type: Object})
  body!: GenericObject;

  @property({type: Object})
  params!: GenericObject;

  @property({type: String})
  token!: string;

  @property({type: Object})
  headers: GenericObject = {};

  @property({type: Boolean})
  loading!: boolean;

  @property({type: Object})
  customHeaders!: GenericObject;

  @property({type: String})
  formattedMethod = 'GET';

  @property({type: Object})
  lastRequest!: GenericObject;

  @property({type: Object})
  lastResponse!: GenericObject;

  @property({type: Object})
  lastError!: GenericObject;

  @property({type: Object})
  lastProgress!: GenericObject;

  @property({type: Array})
  activeRequests!: GenericObject[];

  stateChanged(state: RootState) {
    if(state?.auth?.token && this.token !== state.auth.token) {
      this.token = state.auth.token;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
  
    if (changedProperties.has('headers') || changedProperties.has('token')) {
      this.customHeaders = this._computeHeaders(this.headers, this.token);
    }
    if (changedProperties.has('method')) {
      this.formattedMethod = this._computeFormattedMethod(this.method);
    }
  }

  _computeHeaders(headers: GenericObject, token: string) {
    return Object.assign(
      {},
      {
        Authorization: 'Bearer ' + token,
        'X-CSRFToken': this._getCSRFCookie()
      },
      headers
    );
  }

  _getCSRFCookie() {
    // check for a csrftoken cookie and return its value
    const csrfCookieName = 'csrftoken';
    let csrfToken = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, csrfCookieName.length + 1) === csrfCookieName + '=') {
          csrfToken = decodeURIComponent(cookie.substring(csrfCookieName.length + 1));
          break;
        }
      }
    }
    return csrfToken;
  }

  _computeFormattedMethod(method: string) {
    return (method || '').toUpperCase();
  }

  _handleResponse(e: CustomEvent, ...args: any[]) {
    const request = e.detail;
    const token = request.xhr.getResponseHeader('token');

    if (token) {
      this.reduxStore.dispatch(setToken(token));
    }
    fireEvent(this, 'response', ['response'].concat(Array.from(args)));
  }

  _handleRequest(...args: any[]) {
    fireEvent(this, 'request', ['request'].concat(Array.from(args)));
  }

  _handleError(...args: any[]) {
    if (this.lastError && this.lastError.status === 401) {
      this.reduxStore.dispatch(resetToken());
    }

    if (this.lastError && this.lastError.status === 500) {
      fireEvent(this, 'toast', {
        text: this.localize('an_error_occurred'),
        showCloseBtn: true
      });
    }
    fireEvent(this, 'error', ['error'].concat(Array.from(args)));
  }

  _buildResponse(req: GenericObject) {
    return {
      status: req.status,
      data: req.parseResponse(),
      xhr: req.xhr
    };
  }

  generateRequest(...args: []) {
    return (this.$.ajax as IronAjaxElement).generateRequest.apply(this.$.ajax, args);
  }

  toRequestOptions(...args: []) {
    return (this.$.ajax as IronAjaxElement).toRequestOptions.apply(this.$.ajax, args);
  }

  thunk() {
    return () => {
      const req = this.generateRequest();

      return req
        .completes!.then(() => {
          return this._buildResponse(req);
        })
        .catch(() => {
          return Promise.reject(this._buildResponse(req));
        });
    };
  }

  abort() {
    if (this.lastRequest) {
      this.lastRequest.xhr.abort();
    }
  }

  _addEventListeners() {
    // TODO: (dci) it seems these are not triggered, need to be checked, maybe can be removed ?
    this._handleResponse = this._handleResponse.bind(this);
    this.addEventListener('ajax.response', this._handleResponse as any);
    this._handleRequest = this._handleRequest.bind(this);
    this.addEventListener('ajax.request', this._handleRequest);
    this._handleError = this._handleError.bind(this);
    this.addEventListener('ajax.error', this._handleError);
  }

  _removeEventListeners() {
    this.removeEventListener('ajax.response', this._handleResponse as any);
    this.removeEventListener('ajax.request', this._handleRequest);
    this.removeEventListener('ajax.error', this._handleError);
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._removeEventListeners();
  }
}
window.customElements.define('etools-prp-ajax', EtoolsPrpAjax);

export {EtoolsPrpAjax as EtoolsPrpAjaxEl};
