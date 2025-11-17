import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-management.html',
  styleUrl: './product-management.scss',
})
export class ProductManagement implements OnInit, OnDestroy {
  products: Product[] = [];
  productForm!: FormGroup;
  displayDialog = false;
  isEditMode = false;
  selectedProduct: Product | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize product form
   */
  initializeForm(): void {
    this.productForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      isActive: [true]
    });
  }

  /**
   * Load all products
   */
  loadProducts(): void {
    this.loading = true;

    this.productService.getProducts({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.items;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load products.'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Open dialog to create new product
   */
  openNewProductDialog(): void {
    this.isEditMode = false;
    this.selectedProduct = null;
    this.productForm.reset({ isActive: true, stock: 0, price: 0 });
    this.displayDialog = true;
  }

  /**
   * Open dialog to edit product
   */
  openEditProductDialog(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.productForm.patchValue(product);
    this.displayDialog = true;
  }

  /**
   * Save product (create or update)
   */
  saveProduct(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    const productData = this.productForm.value;

    if (this.isEditMode && this.selectedProduct) {
      // Update existing product
      this.productService.updateProduct(this.selectedProduct.id, productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product updated successfully.'
            });
            this.displayDialog = false;
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update product.'
            });
          }
        });
    } else {
      // Create new product
      this.productService.createProduct(productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Product created successfully.'
            });
            this.displayDialog = false;
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create product.'
            });
          }
        });
    }
  }

  /**
   * Confirm and delete product
   */
  confirmDeleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProduct(product.id);
      }
    });
  }

  /**
   * Delete product
   */
  private deleteProduct(productId: string): void {
    this.productService.deleteProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product deleted successfully.'
          });
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete product.'
          });
        }
      });
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Hide dialog
   */
  hideDialog(): void {
    this.displayDialog = false;
    this.productForm.reset();
  }

  /**
   * Get stock status severity
   */
  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  /**
   * Get stock label
   */
  getStockLabel(stock: number): string {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  }
}
