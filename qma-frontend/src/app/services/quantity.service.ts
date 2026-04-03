import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quantity {
  value: number;
  unit: string;
}

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private http = inject(HttpClient);
  private API_URL = 'https://quantitymeasurementapp-v01.onrender.com/api/quantities';

  mapUnit(unit: string): string {
    const map: any = {
      // LENGTH
      cm: 'CENTIMETER',
      inch: 'INCH',
      ft: 'FEET',
      yard: 'YARD',

      // WEIGHT
      mg: 'MILLIGRAM',
      g: 'GRAM',
      kg: 'KILOGRAM',
      pound: 'POUND',
      tonne: 'TONNE',

      // VOLUME
      ml: 'MILLILITRE',
      l: 'LITRE',
      gallon: 'GALLON',

      // TEMPERATURE
      c: 'CELSIUS',
      f: 'FAHRENHEIT',
    };

    return map[unit.toLowerCase()] || unit.toUpperCase();
  }

  getCategory(unit: string): string {
    const u = unit.toLowerCase();

    if (['cm', 'inch', 'ft', 'yard'].includes(u)) return 'LENGTH';
    if (['mg', 'g', 'kg', 'pound', 'tonne'].includes(u)) return 'WEIGHT';
    if (['c', 'f'].includes(u)) return 'TEMPERATURE';
    if (['ml', 'l', 'gallon'].includes(u)) return 'VOLUME';

    return 'LENGTH';
  }

  prepare(q: Quantity) {
    return {
      ...q,
      unit: this.mapUnit(q.unit),
      measurementType: this.getCategory(q.unit),
    };
  }

  // ✅ Convert
convert(q: Quantity, targetUnit: string): Observable<Quantity> {
  const prepared = this.prepare(q);

  return this.http.post<Quantity>(
    `${this.API_URL}/convert?targetUnit=${this.mapUnit(targetUnit)}`, // ✅ mapped
    prepared // ✅ includes measurementType
  );
}

  // ✅ Compare
  compare(q1: Quantity, q2: Quantity): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/compare`, [this.prepare(q1), this.prepare(q2)]);
  }

  // ✅ Add
  // add(q1: Quantity, q2: Quantity): Observable<Quantity> {
  //   return this.http.post<Quantity>(`${this.API_URL}/add`, [this.prepare(q1), this.prepare(q2)]);
  // }

add(q1: Quantity, q2: Quantity): Observable<Quantity> {
  return this.http.post<Quantity>(
    `${this.API_URL}/add`,
    [this.prepare(q1), this.prepare(q2)]
  );
}

  // ✅ Subtract
  subtract(q1: Quantity, q2: Quantity): Observable<Quantity> {
    return this.http.post<Quantity>(`${this.API_URL}/subtract`, [
      this.prepare(q1),
      this.prepare(q2),
    ]);
  }

  // ✅ Divide
  divide(q1: Quantity, q2: Quantity): Observable<number> {
    return this.http.post<number>(`${this.API_URL}/divide`, [this.prepare(q1), this.prepare(q2)]);
  }

  getHistory() {
    return this.http.get<any[]>(`${this.API_URL}/history`);
  }
}
