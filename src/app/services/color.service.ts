export class ColorService {
  constructor() {}

  public getColor() {
    return null;

    //style layer & bind popup
    pr.layer['options'].weight = 1;
    let amount: any = pr.data[selectedColumn.id];
    if (selectedColumn.columnType === 'header') {
      return;
    }

    let red = 255;
    let green = 0;
    let value: number = amount;
    if (selectedColumn.columnType === 'total') {
      value = amount / selectedColumn.max;
      if (value > 1) {
        value = 1;
      }
    } else if (selectedColumn.columnType === 'average') {
      value = +amount.slice(0, -1) / 100;
    }
    if (value >= 0.5) {
      let diff = 1 - value;
      red = 510 * diff;
      green = 255;
    } else {
      green = 510 * value;
      red = 255;
    }
    console.log('Precint val:' + value);
    pr.layer['options'].fillColor =
      'rgb(' + Math.round(red) + ',' + Math.round(green) + ',0)';
    pr.layer['options'].fillOpacity = 0.8;
    pr.layer.bindPopup(`<pre>${JSON.stringify(pr.data, null, 2)}</pre>`);
  }
}
