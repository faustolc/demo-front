import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService, Product } from '../../services/product.service';
import { ProductDialogComponent } from './product-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = ['code', 'name', 'price', 'created_at', 'actions'];
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  openAddProductDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Remove description if present
        const { code, name, brand, price } = result;
        this.productService.createProduct({ code, name, brand, price }).subscribe({
          next: (newProduct) => {
            this.products.push(newProduct);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            alert('Failed to create product. Please try again.');
          }
        });
      }
    });
  }

  openEditProductDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { product, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Remove description if present
        const { code, name, brand, price } = result;
        this.productService.updateProduct(product.id, { code, name, brand, price }).subscribe({
          next: (updatedProduct) => {
            const index = this.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
              this.products[index] = updatedProduct;
            }
          },
          error: (error) => {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
          }
        });
      }
    });
  }

  exportToPdf(): void {
    this.loading = true;
    this.productService.exportToPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error exporting PDF:', error);
        this.error = 'Failed to export PDF. Please try again.';
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    this.loading = true;
    this.productService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error exporting Excel:', error);
        this.error = 'Failed to export Excel. Please try again.';
        this.loading = false;
      }
    });
  }
}
