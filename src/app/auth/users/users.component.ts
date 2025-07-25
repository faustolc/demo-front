import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { UserDialogComponent } from './user-dialog.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'username', 'createdAt', 'actions'];
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers(); // Refresh table after delete
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user. Please try again.';
        }
      });
    }
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.addUser(result).subscribe({
          next: () => {
            this.loadUsers(); // Refresh table after add
          },
          error: (error) => {
            console.error('Error adding user:', error);
            this.error = 'Failed to add user. Please try again.';
          }
        });
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: { user, isEdit: true }
    });

    dialogRef.afterClosed().pipe(
      finalize(() => {
        this.loadUsers(); // Ensure loading is reset after dialog closes
      })
    ).subscribe(result => {
      if (result) {
        this.userService.editUser(user.id, result).subscribe({
          next: () => {
            //this.loadUsers(); // Refresh table after update
          },
          error: (error) => {
            console.error('Error editing user:', error);
            this.error = 'Failed to edit user. Please try again.';
          }
        });
      }
    });
  }

  exportToPdf(): void {
    this.loading = true;
    this.userService.exportToPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.pdf';
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
    this.userService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.xlsx';
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
