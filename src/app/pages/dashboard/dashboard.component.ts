import { Component, DestroyRef, OnInit, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../core/interfaces/task.interface';
import { HeaderComponent } from '../../shared/header/header.component';
import { AddTaskModalComponent } from './components/add-task-modal/add-task-modal.component';
import { TaskCardComponent } from './components/task-card/task-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, AddTaskModalComponent, TaskCardComponent],
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
  readonly actionError: WritableSignal<string | null> = signal<string | null>(null);
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

  updateStatus(task: Task, status: TaskStatus): void {
    this.taskService.updateTaskStatus(task.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => this.actionError.set(`"${task.title}" לא עודכן, נסה שוב`) });
  }

  deleteTask(task: Task): void {
    this.deletingTaskId.set(task.id);
    this.taskService.deleteTask(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.deletingTaskId.set(null);
          this.actionError.set(`"${task.title}" לא הוסר, נסה שוב`);
        }
      });
  }

  dismissError(): void {
    this.actionError.set(null);
  }

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }
}
