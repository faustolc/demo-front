import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.service';

export interface ProductDialogData {
  product?: Product;
  isEdit: boolean;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Product' : 'Add Product' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field appearance="fill">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="Enter product code">
          <mat-error *ngIf="productForm.get('code')?.hasError('required')">
            Code is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter product name">
          <mat-error *ngIf="productForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Brand</mat-label>
          <input matInput formControlName="brand" placeholder="Enter product brand">
          <mat-error *ngIf="productForm.get('brand')?.hasError('required')">
            Brand is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Price</mat-label>
          <input matInput formControlName="price" placeholder="Enter product price" type="number" step="0.01">
          <mat-error *ngIf="productForm.get('price')?.hasError('required')">
            Price is required
          </mat-error>
          <mat-error *ngIf="productForm.get('price')?.hasError('min')">
            Price must be greater than 0
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="productForm.invalid">
        {{ data.isEdit ? 'Update' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      padding: 20px 24px;
    }

    mat-dialog-actions {
      padding: 8px 24px 20px;
    }
  `]
})
export class ProductDialogComponent implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDialogData
  ) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    if (this.data.isEdit && this.data.product) {
      this.productForm.patchValue({
        code: this.data.product.code,
        name: this.data.product.name,
        brand: this.data.product.brand,
        price: this.data.product.price,
      });
    }
  }

  onSave(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const productData = {
        code: formValue.code,
        name: formValue.name,
        brand: formValue.brand,
        price: formValue.price.toString(),
      };

      this.dialogRef.close(productData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
