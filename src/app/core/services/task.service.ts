import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http: HttpClient = inject(HttpClient);

  readonly tasks: WritableSignal<Task[]> = signal<Task[]>([]);
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);
  readonly error: WritableSignal<string | null> = signal<string | null>(null);

  loadTasksByUser(userId: number | string): void {
    this.loading.set(true);
    this.error.set(null);
    this.http
      .get<Task[]>(`${environment.apiUrl}/tasks`, { params: { userId } })
      .subscribe({
        next: (tasks: Task[]) => {
          this.tasks.set(tasks);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('שגיאה בטעינת המשימות. נסה לרענן את הדף.');
          this.loading.set(false);
        }
      });
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http
      .post<Task>(`${environment.apiUrl}/tasks`, task)
      .pipe(tap((newTask: Task) => this.tasks.update((all: Task[]) => [...all, newTask])));
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http
      .patch<Task>(`${environment.apiUrl}/tasks/${id}`, { status })
      .pipe(tap((updated: Task) =>
        this.tasks.update((all: Task[]) => all.map((t: Task) => t.id === id ? updated : t))
      ));
  }

  deleteTask(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(tap(() =>
        this.tasks.update((all: Task[]) => all.filter((t: Task) => t.id !== id))
      ));
  }
}
