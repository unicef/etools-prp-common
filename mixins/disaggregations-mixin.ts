import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';

function DisaggregationMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DisaggregationClass extends baseClass {
    // Used to display rows for two and three disaggregations.
    // It will NOT work for one and zero disaggregations.
    _determineRows(self: any, rows: any[], columns: any[]) {
      const rowsForDisplay: any[] = [];

      rows.forEach((x) => {
        let formatted = '';

        const rowData = columns.map((z: any) => {
          formatted = self._formatDisaggregationIds([x.id, z.id]);

          return {
            key: formatted,
            data: self.data.disaggregation[formatted]
          };
        });

        formatted = self._formatDisaggregationIds([x.id]);

        rowsForDisplay.push({
          title: x.value,
          data: rowData,
          id: x.id,
          total: {
            key: formatted,
            data: self.data.disaggregation[formatted]
          }
        });
      });

      return rowsForDisplay;
    }

    // Accepts a list of disaggregation IDs, sorts them, and
    // structures them in "()" format for lookup.
    _formatDisaggregationIds(unsortedIds: any[]) {
      // IDs must be in ascending order.
      const ids = unsortedIds.sort((a, b) => a - b);
      let sortedString = '';

      if (ids.length === 1) {
        sortedString = ids[0] + ',';
      } else {
        sortedString = ids.join(', ');
      }

      return `(${sortedString})`;
    }
  }

  return DisaggregationClass;
}

export default DisaggregationMixin;
