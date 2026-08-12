import { SearchConfigDto } from '../dto/search-config.dto';

export interface SearchPayload {
  query: string;
  context: any[];
  settings: SearchConfigDto;
}
