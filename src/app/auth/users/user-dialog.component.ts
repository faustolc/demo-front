import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { MatCheckbox } from "@angular/material/checkbox";
import { Role, RoleService } from '../../services/role.service';

export interface UserDialogData {
  user?: User;
  isEdit: boolean;
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckbox
],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit User' : 'Add User' }}</h2>

    <mat-dialog-content>
      <!-- picture-profile -->
      <div *ngIf="data.isEdit" class="profile-picture-container">
        <label for="file-upload" class="profile-picture-label">
          <img class="profile-avatar" [src]="imagePreview || data.user?.picture_profile" alt="Profile Picture">
          <div class="overlay">
            <mat-icon>edit</mat-icon>
            <span>Change Photo</span>
          </div>
          <mat-spinner *ngIf="isUploading" diameter="50"></mat-spinner>
        </label>
        <input type="file" hidden id="file-upload" (change)="onFileSelected($event)" accept="image/*">
      </div>

      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="fill">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter name">
          <mat-error *ngIf="userForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username">
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Password</mat-label>
          <input matInput
                 formControlName="password"
                 [type]="data.isEdit ? 'password' : 'text'"
                 [placeholder]="data.isEdit ? 'Enter new password (optional)' : 'Enter password'">
          <mat-error *ngIf="userForm.get('password')?.hasError('required') && !data.isEdit">
            Password is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="Enter email">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" placeholder="Enter phone number">
          <mat-error *ngIf="userForm.get('phone')?.hasError('required')">
            Phone is required
          </mat-error>
        </mat-form-field>

        <div class="roles-container">
          <h3>Roles</h3>
          <div *ngFor="let role of availableRoles" class="checkbox-item">
            <mat-checkbox [checked]="isSelected(role.id)" (change)="onRoleChange($event.checked, role.id)">
              {{ role.name | titlecase }}
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
              [disabled]="userForm.invalid">
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

    .profile-picture-container {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .profile-picture-label {
      position: relative;
      cursor: pointer;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
    }
    .profile-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }
    .profile-picture-label .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .profile-picture-label:hover .overlay {
      opacity: 1;
    }
    .profile-picture-label mat-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .roles-container {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .checkbox-item {
      margin-bottom: 10px;
    }
  `]
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = false;
  availableRoles: Role[] = [];
  private selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData,
    private userService: UserService, // Assuming you have a UserService for API calls
    private roleService: RoleService // Assuming you have a Role service to fetch available profiles
  ) {
    const passwordValidators = data.isEdit ? [] : [Validators.required];

    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', passwordValidators],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      roles: this.fb.array([]) // Initialize roles as an empty FormArray
    });
  }

  ngOnInit(): void {
    // Carga los roles disponibles desde el servicio
    this.roleService.getRoles().subscribe(roles => {
      this.availableRoles = roles;

      // Si estamos editando, marca los roles que el usuario ya tiene
      if (this.data.isEdit && this.data.user?.roles) {
        const userRoleIds = this.data.user.roles.map(role => role.id);
        userRoleIds.forEach(roleId => {
          this.rolesFormArray.push(new FormControl(roleId));
        });
      }
    });

    if (this.data.isEdit && this.data.user) {
      this.userForm.patchValue({
        name: this.data.user.name,
        username: this.data.user.username,
        email: this.data.user.email,
        phone: this.data.user.phone
      });
    }
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const userData: User = {
        name: formValue.name,
        username: formValue.username,
        email: formValue.email,
        phone: formValue.phone,
        roles: this.rolesFormArray.value, // Mapea los IDs de roles a objetos
        picture_profile: this.data.isEdit ? this.data.user?.picture_profile || '' : '',
        created_at: this.data.isEdit ? this.data.user?.created_at || '' : '',
        updated_at: new Date().toISOString(),
        id: this.data.isEdit ? this.data.user?.id || '' : '' // Mant
      };

      // Only include password if it's provided (for editing) or required (for new users)
      if (formValue.password) {
        userData.password = formValue.password;
      }

      this.dialogRef.close(userData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // 1. Muestra la vista previa
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // 2. Sube la foto inmediatamente
      this.uploadPhoto();
    }
  }

    // Getter para acceder fácilmente al FormArray
  get rolesFormArray(): FormArray {
    return this.userForm.get('roles') as FormArray;
  }

  // Verifica si un rol está seleccionado
  isSelected(roleId: string): boolean {
    return this.rolesFormArray.value.includes(roleId);
  }

  // Maneja el cambio de estado de un checkbox de rol
  onRoleChange(checked: boolean, roleId: string): void {
    if (checked) {
      this.rolesFormArray.push(new FormControl(roleId));
    } else {
      const index = this.rolesFormArray.controls.findIndex(x => x.value === roleId);
      if (index !== -1) {
        this.rolesFormArray.removeAt(index);
      }
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.data.user?.id) {
      return;
    }

    this.isUploading = true;

    this.userService.uploadProfilePhoto(this.data.user.id, this.selectedFile).pipe(
      // ✅ finalize se ejecutará sin importar si hay éxito o error.
      finalize(() => {
        this.isUploading = false;
      })
    ).subscribe({
      next: (updatedUser) => {
        // La lógica de éxito permanece igual
        if (this.data.user) {
          this.data.user.picture_profile = updatedUser.picture_profile;
        }
        this.imagePreview = null;
      },
      error: (err) => {
        console.error('Error uploading photo:', err);
        this.imagePreview = null;
        // Opcional: Mostrar un mensaje de error al usuario (ej. con MatSnackBar)
      }
    });
  }
}
