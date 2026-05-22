import { Injectable, inject, signal, Signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Task, TaskStatus } from '../interfaces/task.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http: HttpClient = inject(HttpClient);

  private readonly _tasks: WritableSignal<Task[]> = signal<Task[]>([]);
  private readonly _loading: WritableSignal<boolean> = signal<boolean>(false);
  private readonly _error: WritableSignal<string | null> = signal<string | null>(null);

  readonly tasks: Signal<Task[]> = this._tasks.asReadonly();
  readonly loading: Signal<boolean> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  loadTasksByUser(userId: number | string): void {
    this._loading.set(true);
    this._error.set(null);
    this.http
      .get<Task[]>(`${environment.apiUrl}/tasks`, { params: { userId } })
      .subscribe({
        next: (tasks: Task[]) => {
          this._tasks.set(tasks);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('שגיאה בטעינת המשימות. נסה לרענן את הדף.');
          this._loading.set(false);
        }
      });
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http
      .post<Task>(`${environment.apiUrl}/tasks`, task)
      .pipe(tap((newTask: Task) => this._tasks.update((all: Task[]) => [...all, newTask])));
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http
      .patch<Task>(`${environment.apiUrl}/tasks/${id}`, { status })
      .pipe(tap((updated: Task) =>
        this._tasks.update((all: Task[]) => all.map((t: Task) => t.id === id ? updated : t))
      ));
  }

  deleteTask(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(tap(() =>
        this._tasks.update((all: Task[]) => all.filter((t: Task) => t.id !== id))
      ));
  }

  refreshTask(task: Task): void {
    this._tasks.update((all: Task[]) => all.map((t: Task) => t.id === task.id ? { ...task } : t));
  }
}
