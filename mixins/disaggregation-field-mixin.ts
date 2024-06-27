import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';

function DisaggregationFieldMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DisaggregationFieldClass extends baseClass {
    _toNumericValues(obj: any) {
      const parsedObj: any = {};
      // To be noted: Number(null) == 0
      Object.keys(obj).forEach((key) => {
        parsedObj[key] = Number(obj[key]);

        if (obj[key] == null || obj[key] === undefined) {
          console.warn('null converted to 0');
        }
      });
      return parsedObj;
    }
  }

  return DisaggregationFieldClass;
}

export default DisaggregationFieldMixin;
