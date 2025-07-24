import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RoleService, Role } from '../../services/role.service';
import { RoleDialogComponent } from './role-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'created_at', 'actions'];
  roles: Role[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private roleService: RoleService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = null;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.error = 'Failed to load roles. Please try again.';
        this.loading = false;
      }
    });
  }

  openAddRoleDialog(): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '400px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.addRole(result).subscribe({
          next: () => {
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error adding role:', error);
            this.error = 'Failed to add role. Please try again.';
          }
        });
      }
    });
  }

  openEditRoleDialog(role: Role): void {
    const dialogRef = this.dialog.open(RoleDialogComponent, {
      width: '400px',
      data: { role, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roleService.editRole(role.id, result).subscribe({
          next: () => {
            this.loadRoles();
          },
          error: (error) => {
            console.error('Error editing role:', error);
            this.error = 'Failed to edit role. Please try again.';
          }
        });
      }
    });
  }

  deleteRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          this.loadRoles();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.error = 'Failed to delete role. Please try again.';
        }
      });
    }
  }

  exportToPdf(): void {
    this.loading = true;
    this.roleService.exportToPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roles.pdf';
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
    this.roleService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roles.xlsx';
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
