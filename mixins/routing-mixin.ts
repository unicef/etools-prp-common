import { property } from 'lit/decorators.js';
import { Constructor } from '../typings/globals.types';
import { ReduxConnectedElement } from '../ReduxConnectedElement';
import { BASE_PATH } from '../config';

/**
 * @mixinFunction
 */
function RoutingMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class RoutingClass extends baseClass {
    @property({ type: String })
    _$currentWorkspace!: string;

    @property({ type: String })
    _$currentApp!: string;

    @property({ type: String })
    _$currentPlan!: string;

    @property({ type: String })
    _baseUrl!: string;

    @property({ type: String })
    _baseUrlCluster!: string;

    private BEHAVIOR_NAME = 'RoutingBehavior';

    updated(changedProperties: Map<string | number | symbol, unknown>) {
      super.updated(changedProperties);

      if (
        changedProperties.has('_$currentWorkspace') ||
        changedProperties.has('_$currentApp')
      ) {
        this._baseUrl = this._$computeBaseUrl(
          this._$currentWorkspace,
          this._$currentApp
        );
      }

      if (
        changedProperties.has('_$currentWorkspace') ||
        changedProperties.has('_$currentApp') ||
        changedProperties.has('_$currentPlan')
      ) {
        this._baseUrlCluster = this._$computeBaseUrlCluster(
          this._$currentWorkspace,
          this._$currentApp,
          this._$currentPlan
        );
      }
    }

    _$computeBaseUrl(workspace: string, app: string) {
      return `/${BASE_PATH}/${workspace}/${app}`;
    }

    _$computeBaseUrlCluster(workspace: string, app: string, planId: string) {
      return `${this._$computeBaseUrl(workspace, app)}/plan/${planId}`;
    }

    buildBaseUrl(workspace: string, item: string) {
      return this._$computeBaseUrl(workspace, item);
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
        if (typeof this.reduxStore.dispatch !== 'function') {
          throw new Error(`${this.BEHAVIOR_NAME} requires ReduxBehavior`);
        }
      });
    }
  }
  return RoutingClass;
}

export default RoutingMixin;
