import { Pipe, PipeTransform } from '@angular/core';

/**
 * Date formatting pipe to match RAGFlow date display format
 * Formats timestamps to DD/MM/YYYY HH:mm:ss
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Transform a timestamp to formatted date string
   * @param value - Unix timestamp (milliseconds) or Date object
   * @param format - Optional format string (default: 'DD/MM/YYYY HH:mm:ss')
   * @returns Formatted date string
   */
  transform(
    value: number | Date | string | null | undefined,
    format: 'full' | 'date-only' = 'full',
  ): string {
    if (!value) {
      return '';
    }

    const date = typeof value === 'number' || typeof value === 'string' ? new Date(value) : value;

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const day = this.padZero(date.getDate());
    const month = this.padZero(date.getMonth() + 1);
    const year = date.getFullYear();

    if (format === 'date-only') {
      return `${day}/${month}/${year}`;
    }

    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
