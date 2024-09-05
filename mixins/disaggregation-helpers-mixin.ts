import {LitElement} from 'lit';
import {Constructor} from '../typings/globals.types';

function DisaggregationHelpersMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DisaggregationHelpersClass extends baseClass {
    private matchers = {
      '(?,?)': () => /^\((\d*),\s?(\d*)\)$/,
      '(?,?,?)': () => /^\((\d*),\s?(\d*),\s?(\d*)\)$/,
      '(?,Y)': (y: string) => new RegExp(`^\\((\\d+),\\s?(${y})\\)$`),
      '(X,?)': (x: string) => new RegExp(`^\\((${x}),\\s?(\\d+)\\)$`),
      '(X,Y,?)': (x: string, y: string) => new RegExp(`^\\((${x}),\\s?(${y}),\\s?(\\d+)\\)$`),
      '(X,?,Z)': (x: string, z: string) => new RegExp(`^\\((${x}),\\s?(\\d+),\\s?(${z})\\)$`),
      '(?,Y,Z)': (y: string, z: string) => new RegExp(`^\\((\\d+),\\s?(${y}),\\s?(${z})\\)$`),
      '(?,?,Z)': (z: string) => new RegExp(`^\\((\\d+),\\s?(\\d+),\\s?(${z})\\)$`)
    };

    _calculateLevel1(key: string, data: any) {
      const coords = this.getCoords(key);
      const y = coords[1];
      const yRe = this.matchers['(?,Y)'](y);
      const totals: any = {};
      const yKey = this.formatKey(y);
      const yFields = this.extractFields(data, yRe);
      totals[yKey] = this.sumDisaggValues(yFields);
      return totals;
    }

    _calculateLevel2(key: string, data: any) {
      const coords = this.getCoords(key);
      const [x, y] = coords;
      if (!x || !y) return;

      const xRe = this.matchers['(X,?)'](x);
      const yRe = this.matchers['(?,Y)'](y);
      const tRe = this.matchers['(?,Y)']('');

      const tmpTotals1: any = {};
      const tmpTotals2: any = {};

      const xKey = this.formatKey(x, '');
      const yKey = this.formatKey(y, '');

      const xFields = this.extractFields(data, xRe);
      const yFields = this.extractFields(data, yRe);

      tmpTotals1[xKey] = this.sumDisaggValues(xFields);
      tmpTotals1[yKey] = this.sumDisaggValues(yFields);

      data = {...data, ...tmpTotals1};

      const tKey = this.formatKey('');
      const tFields = this.extractFields(data, tRe);

      tmpTotals2[tKey] = this.sumDisaggValues(tFields, this.divideBy(2));

      return {...tmpTotals1, ...tmpTotals2};
    }

    _calculateLevel3(key: string, data: any) {
      const coords = this.getCoords(key);
      const [x, y, z] = coords;
      if (!x || !y || !z) return;

      const xyRe = this.matchers['(X,Y,?)'](x, y);
      const xzRe = this.matchers['(X,?,Z)'](x, z);
      const yzRe = this.matchers['(?,Y,Z)'](y, z);
      const xRe = this.matchers['(X,?)'](x);
      const yRe = this.matchers['(?,Y)'](y);
      const zRe = this.matchers['(?,?,Z)'](z);
      const tRe = this.matchers['(?,Y)']('');

      const tmpTotals1: any = {};
      const tmpTotals2: any = {};
      const tmpTotals3: any = {};

      const xyKey = this.formatKey(x, y);
      const xzKey = this.formatKey(x, z);
      const yzKey = this.formatKey(y, z);

      const xyFields = this.extractFields(data, xyRe);
      const xzFields = this.extractFields(data, xzRe);
      const yzFields = this.extractFields(data, yzRe);

      tmpTotals1[xyKey] = this.sumDisaggValues(xyFields);
      tmpTotals1[xzKey] = this.sumDisaggValues(xzFields);
      tmpTotals1[yzKey] = this.sumDisaggValues(yzFields);

      data = {...data, ...tmpTotals1};

      const xKey = this.formatKey(x, '');
      const yKey = this.formatKey(y, '');
      const zKey = this.formatKey(z, '');

      const xFields = this.extractFields(data, xRe);
      const yFields = this.extractFields(data, yRe);
      const zFields = this.extractFields(data, zRe);

      tmpTotals2[xKey] = this.sumDisaggValues(xFields, this.divideBy(2));
      tmpTotals2[yKey] = this.sumDisaggValues(yFields);
      tmpTotals2[zKey] = this.sumDisaggValues(zFields);

      data = {...data, ...tmpTotals2};

      const tKey = this.formatKey('');
      const tFields = this.extractFields(data, tRe);

      tmpTotals3[tKey] = this.sumDisaggValues(tFields, this.divideBy(3));

      return {...tmpTotals1, ...tmpTotals2, ...tmpTotals3};
    }

    private identity(val: any) {
      return val;
    }

    private divideBy(d: number) {
      return (v: number) => v / d;
    }

    private sumDisaggValues(fields: any[], transform: (x: number) => number = this.identity) {
      const result = fields
        .filter((field) => ['v', 'd'].every((key) => !isNaN(field[key])))
        .reduce((acc, curr) => {
          ['v', 'd'].forEach((key) => {
            acc[key] = (acc[key] || 0) + transform!(curr[key]);
          });
          return acc;
        }, {} as {[key: string]: number});

      const c = result.d > 0 ? result.v / result.d : 0;
      result.c = isNaN(c) ? 0 : c;

      return result;
    }

    private getCoords(key: string) {
      const match = [this.matchers['(?,?)'](), this.matchers['(?,?,?)']()].map((re) => re.exec(key)).filter(Boolean)[0];
      return match ? match.slice(1, 4) : [];
    }

    private extractFields(data: any, re: RegExp) {
      return Object.keys(data)
        .filter((k) => re.exec(k))
        .map((k) => data[k]);
    }

    private formatKey(...args: any[]) {
      const chunks = Array.from(args);
      const formatted = `(${chunks.join(', ')})`;
      return formatted.replace(/(,)(\s)(\))$/, '$1$3');
    }
  }

  return DisaggregationHelpersClass;
}

export default DisaggregationHelpersMixin;
