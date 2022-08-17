import {PolymerElement} from '@polymer/polymer';
import {Constructor, GenericObject} from '../typings/globals.types';

/**
 * @polymer
 * @mixinFunction
 */
function DisaggregationFieldMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class DisaggregationFieldClass extends baseClass {
    _toNumericValues(obj: GenericObject) {
      const parsedObj = {};
      // To be noted: Number(null) == 0
      Object.keys(obj).forEach((key) => {
        parsedObj[key] = Number(obj[key]);

        if (obj[key] == null || obj[key] == undefined) {
          console.warn('null converted to 0');
        }
      });
      return parsedObj;
    }
  }

  return DisaggregationFieldClass;
}

export default DisaggregationFieldMixin;
