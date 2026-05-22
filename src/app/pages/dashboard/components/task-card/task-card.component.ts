import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskPriority, TaskStatus } from '../../../../core/interfaces/task.interface';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() isDeleting = false;

  @Output() readonly statusChange = new EventEmitter<TaskStatus>();
  @Output() readonly deleteRequested = new EventEmitter<void>();

  priorityLabel(priority: TaskPriority): string {
    return {
      [TaskPriority.High]: 'גבוהה',
      [TaskPriority.Medium]: 'בינונית',
      [TaskPriority.Low]: 'נמוכה'
    }[priority];
  }
}
