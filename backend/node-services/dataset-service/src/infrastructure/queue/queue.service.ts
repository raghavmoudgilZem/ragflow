import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('parsing') private parsingQueue: Queue,
    @InjectQueue('indexing') private indexingQueue: Queue,
  ) {}

  async addParsingJob(data: any) {
    return this.parsingQueue.add('parse-document', data);
  }

  async addIndexingJob(data: any) {
    return this.indexingQueue.add('index-chunks', data);
  }
}
