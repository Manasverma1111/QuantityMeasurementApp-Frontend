// import { Component, inject, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { QuantityService, Quantity } from '../services/quantity.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [FormsModule, CommonModule],
//   templateUrl: './dashboard.html',
//   styleUrl: './dashboard.scss',
// })
// export class Dashboard implements OnInit {

//   private quantityService = inject(QuantityService);

//   // Categories
//  categories: any = {

//   LENGTH: [
//     { label: 'Centimeter', value: 'cm' },
//     { label: 'Inch', value: 'inch' },
//     { label: 'Feet', value: 'ft' },
//     { label: 'Yard', value: 'yard' }
//   ],

//   WEIGHT: [
//     { label: 'Milligram', value: 'mg' },
//     { label: 'Gram', value: 'g' },
//     { label: 'Kilogram', value: 'kg' },
//     { label: 'Pound', value: 'pound' },
//     { label: 'Tonne', value: 'tonne' }
//   ],

//   TEMPERATURE: [
//     { label: 'Celsius', value: 'c' },
//     { label: 'Fahrenheit', value: 'f' }
//   ],

//   VOLUME: [
//     { label: 'Millilitre', value: 'ml' },
//     { label: 'Litre', value: 'l' },
//     { label: 'Gallon', value: 'gallon' }
//   ]
// };

//   selectedCategory = 'LENGTH';
//   units: any[] = this.categories['LENGTH'];

//   // Inputs
//   q1: Quantity = { value: 0, unit: 'cm' };
//   q2: Quantity = { value: 0, unit: 'cm' };

//   // Results
//   result: any = null;
//   preview: any = null;

//   // History
//   history: any[] = [];

//   ngOnInit() {
//     this.loadHistory();
//   }

//   // Change category
// onCategoryChange(category: string) {
//   this.selectedCategory = category;
//   this.units = this.categories[category];

//   this.q1.unit = this.units[0].value;
//   this.q2.unit = this.units[0].value;

//   this.preview = null;
//   this.result = null;
// }

//   // Auto preview
//   onValueChange() {
//     if (!this.q1.value) return;

//     this.quantityService
//       .convert(this.q1, this.q2.unit)
//       .subscribe(res => this.preview = res);
//   }

//   // Operations
//   convert() {
//     this.quantityService.convert(this.q1, this.q2.unit)
//       .subscribe(res => this.result = res);
//   }

//   add() {
//     this.quantityService.add(this.q1, this.q2)
//       .subscribe(res => this.result = res);
//   }

//   subtract() {
//     this.quantityService.subtract(this.q1, this.q2)
//       .subscribe(res => this.result = res);
//   }

//   compare() {
//     this.quantityService.compare(this.q1, this.q2)
//       .subscribe(res => this.result = res ? 'Equal' : 'Not Equal');
//   }

//   divide() {
//     this.quantityService.divide(this.q1, this.q2)
//       .subscribe(res => this.result = res);
//   }

//   // History
//   loadHistory() {
//     this.quantityService.getHistory()
//       .subscribe(res => this.history = res);
//   }
// }

import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuantityService, Quantity } from '../services/quantity.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  private quantityService = inject(QuantityService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Category icons map (used in template)
  categoryIcons: Record<string, string> = {
    LENGTH: '↔',
    WEIGHT: '⚖',
    TEMPERATURE: '🌡',
    VOLUME: '⬡',
  };

  // Categories
  categories: any = {
    LENGTH: [
      { label: 'Centimeter', value: 'cm' },
      { label: 'Inch', value: 'inch' },
      { label: 'Feet', value: 'ft' },
      { label: 'Yard', value: 'yard' },
    ],
    WEIGHT: [
      { label: 'Milligram', value: 'mg' },
      { label: 'Gram', value: 'g' },
      { label: 'Kilogram', value: 'kg' },
      { label: 'Pound', value: 'pound' },
      { label: 'Tonne', value: 'tonne' },
    ],
    TEMPERATURE: [
      { label: 'Celsius', value: 'c' },
      { label: 'Fahrenheit', value: 'f' },
    ],
    VOLUME: [
      { label: 'Millilitre', value: 'ml' },
      { label: 'Litre', value: 'l' },
      { label: 'Gallon', value: 'gallon' },
    ],
  };

  selectedCategory = 'LENGTH';
  units: any[] = this.categories['LENGTH'];

  // Inputs
  q1: Quantity = { value: 0, unit: 'cm' };
  q2: Quantity = { value: 0, unit: 'cm' };

  // Results
  result: any = null;
  preview: any = null;

  // History
  history: any[] = [];

  ngOnInit() {
    this.loadHistory();
  }

  // Logout
  // logout() {
  //   // Clear any stored auth token if applicable
  //   localStorage.removeItem('token');
  //   this.router.navigate(['/login']);
  // }

  logout() {
    this.authService.logout(); // ✅ use centralized logout
  }

  // Change category
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.units = this.categories[category];

    // ✅ Reset BOTH value + unit (IMPORTANT)
    this.q1 = { value: 0, unit: this.units[0].value };
    this.q2 = { value: 0, unit: this.units[0].value };

    // ✅ Clear outputs
    this.preview = null;
    this.result = null;
  }

  // Auto preview
  // onValueChange() {
  //   if (!this.q1.value) return;

  //   this.quantityService.convert(this.q1, this.q2.unit).subscribe((res) => (this.preview = res));
  // }

  // Operations
  // convert() {
  //   this.quantityService.convert(this.q1, this.q2.unit).subscribe((res) => (this.result = res));
  // }

convert() {
  console.log("Convert clicked");

  if (!this.q1.value) return;

  console.log("Calling service...");  // ✅ ADD THIS

  this.quantityService
    .convert(this.q1, this.q2.unit)
    .subscribe((res: any) => {
      console.log("Response:", res);
      this.result = res;
      this.q2.value = res.value;
    });
}

  add() {
    this.quantityService.add(this.q1, this.q2).subscribe((res) => (this.result = res));
  }

  subtract() {
    this.quantityService.subtract(this.q1, this.q2).subscribe((res) => (this.result = res));
  }

  compare() {
    this.quantityService
      .compare(this.q1, this.q2)
      .subscribe((res) => (this.result = res ? 'Equal' : 'Not Equal'));
  }

  divide() {
    this.quantityService.divide(this.q1, this.q2).subscribe((res) => (this.result = res));
  }

  // History
  loadHistory() {
    this.quantityService.getHistory().subscribe((res) => (this.history = res));
  }
}
