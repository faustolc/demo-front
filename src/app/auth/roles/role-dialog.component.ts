import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Role } from '../../services/role.service';

export interface RoleDialogData {
  role?: Role;
  isEdit: boolean;
}

@Component({
  selector: 'app-role-dialog',
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
  `]
})
export class RoleDialogComponent {
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]]
    });

    if (data.isEdit && data.role) {
      this.roleForm.patchValue({
        name: data.role.name
      });
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
