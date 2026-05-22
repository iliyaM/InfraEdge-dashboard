import {Component, DestroyRef, EventEmitter, inject, Output, signal, WritableSignal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../core/services/auth.service';
import {TaskService} from '../../../../core/services/task.service';
import {TaskPriority, TaskStatus} from '../../../../core/interfaces/task.interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss'
})
export class AddTaskModalComponent {
  readonly TaskPriority: typeof TaskPriority = TaskPriority;
  @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();

  private taskService: TaskService = inject(TaskService);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private destroyRef: DestroyRef = inject(DestroyRef);

  readonly submitError: WritableSignal<string | null> = signal<string | null>(null);
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  readonly taskForm = new FormGroup({
    title: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
    priority: new FormControl<TaskPriority>(TaskPriority.High, {nonNullable: true}),
    status: new FormControl<TaskStatus>('todo', {nonNullable: true})
  });

  submit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const userId: number | undefined = this.auth.loggedInUser()?.id;

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    const {title, priority, status} = this.taskForm.getRawValue();

    this.loading.set(true);
    this.submitError.set(null);

    this.taskService.createTask({title, priority, status, userId}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.closed.emit(),
      error: () => {
        this.submitError.set('שגיאה ביצירת המשימה. נסה שוב.');
        this.loading.set(false);
      }
    });
  }

  close(): void {
    this.taskForm.reset();
    this.closed.emit();
  }
}
