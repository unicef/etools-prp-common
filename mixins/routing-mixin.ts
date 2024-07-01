import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';
import {BASE_PATH} from '../config';
import {property} from 'lit/decorators.js';
import {store} from '../../redux/store';
import {RootState} from '../../typings/redux.types';

/**
 * @mixinFunction
 */
function RoutingMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class RoutingClass extends baseClass {
    @property({type: String})
    _currentWorkspace?: string;

    @property({type: String})
    _currentApp?: string;

    @property({type: String})
    _currentPlan?: string;

    @property({type: String})
    _baseUrl!: string;

    @property({type: String})
    _baseUrlCluster!: string;

    private BEHAVIOR_NAME = 'RoutingBehavior';

    stateChanged(state: RootState) {
      this._currentWorkspace = state.workspaces.current;
      this._currentApp = state.app.current;
      this._currentPlan = state.responsePlans.current;
    }

    updated(changedProperties) {
      super.updated(changedProperties);

      if (changedProperties.has('_currentWorkspace') || changedProperties.has('_currentApp')) {
        this._baseUrl = this._computeBaseUrl(this._currentWorkspace, this._currentApp);
      }

      if (
        changedProperties.has('_currentWorkspace') ||
        changedProperties.has('_currentApp') ||
        changedProperties.has('_currentPlan')
      ) {
        this._baseUrlCluster = this._computeBaseUrlCluster(this._currentWorkspace, this._currentApp, this._currentPlan);
      }
    }

    _computeBaseUrl(workspace?: string, app?: string) {
      return `/${BASE_PATH}/${workspace}/${app}`;
    }

    _computeBaseUrlCluster(workspace?: string, app?: string, planId?: string) {
      return `${this._computeBaseUrl(workspace, app)}/plan/${planId}`;
    }

    buildBaseUrl(workspace: string, item: string) {
      return this._computeBaseUrl(workspace, item);
    }

    buildUrl(baseUrl: string, tail: string) {
      if (tail.length && tail[0] !== '/') {
        tail = '/' + tail;
      }
      return baseUrl + tail;
    }

    connectedCallback() {
      super.connectedCallback();

      setTimeout(() => {
        if (typeof store.dispatch !== 'function') {
          throw new Error(`${this.BEHAVIOR_NAME} requires ReduxBehavior`);
        }
      });
    }
  }

  return RoutingClass;
}

export default RoutingMixin;
