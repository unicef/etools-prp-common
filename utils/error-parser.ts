export function formatServerErrorAsText(error, defaultErrorText: string) {
  const errorsArray = getErrorsArray(error.data ? error.data : error);
  if (errorsArray && errorsArray.length) {
    return errorsArray.join('\n');
  }
  return defaultErrorText;
}

/**
 *
 * @param errors
 * @param keyTranslate - optional function to translate error keys
 * @returns {string[]}
 */
export function getErrorsArray(errors: any, keyTranslate = defaultKeyTranslate) {
  if (!errors) {
    return [];
  }

  if (typeof errors === 'string') {
    return [errors];
  }

  if (Array.isArray(errors)) {
    return flatten(errors.map((error) => (typeof error === 'string' ? error : getErrorsArray(error, keyTranslate))));
  }

  const isObject = typeof errors === 'object';
  if (isObject && errors.error && typeof errors.error === 'string') {
    return [errors.error];
  }

  if (isObject && errors.errors && Array.isArray(errors.errors)) {
    return flatten(
      errors.errors.map(function (err) {
        if (typeof err === 'object') {
          return Object.values(err); // will work only for strings
        } else {
          return err;
        }
      })
    );
  }

  if (isObject && errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
    return errors.non_field_errors;
  }

  if (isObject) {
    delete errors['error_codes'];

    return flatten(
      Object.entries(errors).map(([field, value]) => {
        const translatedField = keyTranslate(field);
        if (typeof value === 'string') {
          return `Field ${translatedField} - ${value}`;
        }
        if (Array.isArray(value)) {
          const baseText = `Field ${translatedField}: `;
          const textErrors = getErrorsArray(value, keyTranslate);
          // * The marking is used for display in etools-error-messages-box
          // * and adds a welcomed identations when displayed as a toast message
          return textErrors.length === 1 ? `${baseText}${textErrors}` : [baseText, ..._markNestedErrors(textErrors)];
        }
        if (typeof value === 'object') {
          return Object.entries(value!).map(
            ([nestedField, nestedValue]) =>
              `Field ${translatedField} (${keyTranslate(nestedField)}) - ${getErrorsArray(nestedValue, keyTranslate)}`
          );
        }
      })
    );
  }

  return [];
}

function flatten(array) {
  return array.reduce((flattened, elem) => flattened.concat(Array.isArray(elem) ? flatten(elem) : elem), []);
}

function _markNestedErrors(errs) {
  // @ts-ignore
  return errs.map((er) => ' ' + er);
}

function defaultKeyTranslate(key = '') {
  return key
    .split('_')
    .map((fieldPart) => `${fieldPart[0].toUpperCase()}${fieldPart.slice(1)}`)
    .join(' ');
}
