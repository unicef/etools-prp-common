import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {setToken} from '../../redux/actions';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 */
@customElement('etools-prp-auth')
export class EtoolsPrpAuth extends connect(store)(LitElement) {
  @property({type: String})
  token!: string;

  @property({type: Boolean})
  authenticated!: boolean;

  connectedCallback() {
    super.connectedCallback();
    // Use saved token, if present
    const savedToken = localStorage.getItem('token');

    if (savedToken && !this.token) {
      store.dispatch(setToken(savedToken));
    }
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(state?.auth?.token, this.token)) {
      this.token = state.auth.token;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('token')) {
      this.authenticated = this._computeAuthenticated(this.token);
    }
  }

  _computeAuthenticated(token: string) {
    return !!token;
  }
}
