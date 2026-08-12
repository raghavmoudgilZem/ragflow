import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColorPipe',
})
export class StatusColorPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
