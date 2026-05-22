import { Component, DestroyRef, OnInit, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../core/interfaces/task.interface';
import { HeaderComponent } from '../../shared/header/header.component';
import { AddTaskModalComponent } from './components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, AddTaskModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly TaskPriority: typeof TaskPriority = TaskPriority;

  readonly taskService: TaskService = inject(TaskService);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly priorityFilter: WritableSignal<TaskPriority | null> = signal<TaskPriority | null>(null);
  readonly isModalOpen: WritableSignal<boolean> = signal<boolean>(false);
  readonly taskErrors: WritableSignal<Record<string, string>> = signal<Record<string, string>>({});
  readonly deletingTaskId: WritableSignal<string | null> = signal<string | null>(null);

  readonly filteredTasks: Signal<Task[]> = computed(() => {
    const filter: TaskPriority | null = this.priorityFilter();
    return filter
      ? this.taskService.tasks().filter((t: Task) => t.priority === filter)
      : this.taskService.tasks();
  });

  readonly todoTasks: Signal<Task[]> = computed(() => this.filteredTasks().filter((t: Task) => t.status === 'todo'));
  readonly inProgressTasks: Signal<Task[]> = computed(() => this.filteredTasks().filter((t: Task) => t.status === 'in-progress'));
  readonly doneTasks: Signal<Task[]> = computed(() => this.filteredTasks().filter((t: Task) => t.status === 'done'));

  ngOnInit(): void {
    const userId = this.auth.loggedInUser()?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }
    this.taskService.loadTasksByUser(userId);
  }

  setFilter(priority: TaskPriority | null): void {
    this.priorityFilter.set(priority);
  }

  priorityLabel(priority: TaskPriority): string {
    return {
      [TaskPriority.High]: 'גבוהה',
      [TaskPriority.Medium]: 'בינונית',
      [TaskPriority.Low]: 'נמוכה'
    }[priority];
  }

  updateStatus(task: Task, status: TaskStatus): void {
    this.taskService.updateTaskStatus(task.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.setTaskError(task.id, 'עדכון הסטטוס נכשל') });
  }

  deleteTask(taskId: string): void {
    this.deletingTaskId.set(taskId);
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.deletingTaskId.set(null);
          this.setTaskError(taskId, 'מחיקת המשימה נכשלה');
        }
      });
  }

  private setTaskError(taskId: string, message: string): void {
    this.taskErrors.update((errors: Record<string, string>) => ({ ...errors, [taskId]: message }));
    setTimeout(() => {
      this.taskErrors.update((errors: Record<string, string>) => {
        const next: Record<string, string> = { ...errors };
        delete next[taskId];
        return next;
      });
    }, 4000);
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }
}
