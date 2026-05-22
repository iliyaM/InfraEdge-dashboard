import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, WritableSignal, signal } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnChanges {
  @Input({ required: true }) task!: Task;
  @Input() isDeleting = false;

  @Output() readonly statusChange = new EventEmitter<TaskStatus>();
  @Output() readonly deleteRequested = new EventEmitter<void>();

  readonly displayStatus: WritableSignal<TaskStatus> = signal<TaskStatus>('todo');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.displayStatus.set(this.task.status);
    }
  }

  onStatusChange(value: TaskStatus): void {
    this.displayStatus.set(value);
    this.statusChange.emit(value);
  }

  priorityLabel(priority: TaskPriority): string {
    return {
      [TaskPriority.High]: 'גבוהה',
      [TaskPriority.Medium]: 'בינונית',
      [TaskPriority.Low]: 'נמוכה'
    }[priority];
  }
}
