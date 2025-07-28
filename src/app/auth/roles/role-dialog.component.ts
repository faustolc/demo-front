import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Role } from '../../services/role.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface RoleDialogData {
  role?: Role;
  isEdit: boolean;
}

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Role' : 'Add Role' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="roleForm" class="role-form">
        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter role name">
          <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>
        <div class="sections-container">
          <h3>Authorized Sections</h3>
          <div *ngFor="let section of availableSections" class="checkbox-item">
            <mat-checkbox [checked]="isSelected(section)" (change)="onSectionChange($event.checked, section)">
              {{ section | titlecase }}
            </mat-checkbox>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button
              color="primary"
              (click)="onSave()"
              [disabled]="roleForm.invalid">
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
    .sections-container {
      margin-top: 20px;
    }
    .checkbox-item {
      margin-bottom: 10px;
    }
  `]
})
export class RoleDialogComponent {
  roleForm: FormGroup;
  availableSections: string[] = ['products', 'roles', 'users'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      authorized_sections: this.fb.array([]),
    });
  }
  ngOnInit(): void {
    if (this.data.isEdit && this.data.role) {
      this.roleForm.patchValue({
        name: this.data.role.name
      });
      // Rellena el FormArray con las secciones que el rol ya tiene
      this.data.role.authorized_sections.forEach(section => {
        this.sectionsFormArray.push(new FormControl(section));
      });
    }
  }

  // Getter para acceder fácilmente al FormArray desde la plantilla o el código
  get sectionsFormArray(): FormArray {
    return this.roleForm.get('authorized_sections') as FormArray;
  }

  // Verifica si una sección está seleccionada
  isSelected(section: string): boolean {
    return this.sectionsFormArray.value.includes(section);
  }

  // Maneja el cambio de estado de un checkbox
  onSectionChange(checked: boolean, section: string): void {
    if (checked) {
      // Si se marca, añade la sección al array
      this.sectionsFormArray.push(new FormControl(section));
    } else {
      // Si se desmarca, busca el índice y la elimina del array
      const index = this.sectionsFormArray.controls.findIndex(x => x.value === section);
      if (index !== -1) {
        this.sectionsFormArray.removeAt(index);
      }
    }
  }

  onSave(): void {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
