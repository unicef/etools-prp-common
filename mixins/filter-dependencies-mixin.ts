import {property, state} from 'lit/decorators.js';
import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';

function FilterDependenciesMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class FilterDependenciesClass extends baseClass {
    @property({type: String})
    lastParams = '';

    @property({type: Object})
    params!: any;

    @property({type: String})
    dependencies = '';

    @property({type: Object})
    defaultParams: any = {};

    @state()
    queryParams: any = {};

    updated(changedProperties) {
      super.updated(changedProperties);
      if (changedProperties.has('dependencies') || changedProperties.has('queryParams')) {
        this._computeParams(this.dependencies, this.queryParams);
      }
    }

    _computeParams(dependencies: string, queryParams: any) {
      if (!queryParams) {
        return;
      }

      const newParams = dependencies
        .split(',')
        .filter(Boolean)
        .reduce(
          (acc, key) => {
            if (typeof queryParams[key] !== 'undefined') {
              acc[key] = queryParams[key];
            }
            return acc;
          },
          {...this.defaultParams}
        );

      const serialized = this._serializeParams(newParams);

      if (serialized !== this.lastParams) {
        this.lastParams = serialized;
        this.params = newParams;
      }
    }

    _serializeParams(params: any) {
      return JSON.stringify(params);
    }
  }

  return FilterDependenciesClass;
}

export default FilterDependenciesMixin;
